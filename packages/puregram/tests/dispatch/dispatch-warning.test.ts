import { setImmediate as tick } from 'node:timers/promises'

import type { TelegramUser } from '@puregram/api'
import { describe, expect, it } from 'vitest'

import { createPlugin } from '../../src/plugins/plugin'
import { Telegram } from '../../src/telegram'

const bot: TelegramUser = { id: 1, is_bot: true, first_name: 'test' }

// `bot` in options skips the getMe call, so start() never touches the network
async function warningsFromStart (tg: Telegram) {
  const seen: (Error & { code?: string })[] = []
  const listener = (warning: Error) => {
    seen.push(warning)
  }

  process.on('warning', listener)

  try {
    await tg.start()
    await tick()
  } finally {
    process.off('warning', listener)
  }

  return seen.filter(w => w.code === 'PUREGRAM_NO_DISPATCH_ERROR_HANDLER')
}

describe('crash-by-default startup warning', () => {
  it('warns when starting without a dispatch error handler', async () => {
    const warnings = await warningsFromStart(new Telegram({ token: 'X', bot }))

    expect(warnings).toHaveLength(1)
    expect(warnings[0]?.message).toContain('tg.catch')
  })

  it('stays silent when tg.catch is registered', async () => {
    const tg = new Telegram({ token: 'X', bot })

    tg.catch(() => {})

    expect(await warningsFromStart(tg)).toHaveLength(0)
  })

  it('stays silent when swallowDispatchErrors is set', async () => {
    const tg = new Telegram({ token: 'X', bot, swallowDispatchErrors: true })

    expect(await warningsFromStart(tg)).toHaveLength(0)
  })

  it('stays silent when a plugin registers tg.catch during install', async () => {
    const tg = new Telegram({ token: 'X', bot })

    tg.extend(createPlugin({
      name: 'guard',
      install: (t) => {
        t.catch(() => {})

        return {}
      }
    }))

    expect(await warningsFromStart(tg)).toHaveLength(0)
  })
})
