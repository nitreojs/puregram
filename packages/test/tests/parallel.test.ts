import { Telegram } from 'puregram'
import { describe, expect, it } from 'vitest'

import { createTestEnv } from '../src'

describe('parallel envs', () => {
  it('two envs in parallel do not cross-contaminate', async () => {
    async function run (label: string) {
      const tg = new Telegram({ token: `TEST-${label}`, apiBaseUrl: 'http://unused/bot' })
      const env = createTestEnv(tg)
      const alice = env.createUser({ first_name: `Alice-${label}` })

      tg.onMessage(async (u) => {
        await tg.api.sendMessage({ chat_id: u.chat.id, text: `${label}: ${u.text}` })
      })

      await alice.sendMessage('hi')

      const calls = env.callsTo('sendMessage')

      await env.shutdown()

      return calls
    }

    const [a, b] = await Promise.all([run('A'), run('B')])

    expect(a).toHaveLength(1)
    expect(b).toHaveLength(1)
    expect(a[0]?.params.text).toBe('A: hi')
    expect(b[0]?.params.text).toBe('B: hi')
  })
})
