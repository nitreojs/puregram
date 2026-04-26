import { Telegram } from 'puregram'
import { describe, expect, it } from 'vitest'

import type { MediaGroupUpdate } from '../../src'
import { mediaGroup } from '../../src'

describe('mediaGroup plugin', () => {
  it('install registers tg.media_group with flush + accepts media_group emissions', async () => {
    const t = new Telegram({ token: 'TEST' }).extend(mediaGroup({ window: 1000 }))

    await t.start()

    const ext = (t as any).media_group as { flush: () => void }

    expect(typeof ext.flush).toBe('function')

    const composites: MediaGroupUpdate[] = []

    t.on('media_group', u => {
      composites.push(u)
    })

    // tg.defineUpdate('media_group') happened during install — emit must succeed
    t.emit('media_group', { id: 'forced', messages: [] })

    await new Promise(resolve => setImmediate(resolve))

    expect(composites).toHaveLength(1)
    expect(composites[0]?.kind).toBe('media_group')

    await t.shutdown()
  })

  it('plugin install does not blow up; extension is registered under tg.media_group', async () => {
    const t = new Telegram({ token: 'TEST' }).extend(mediaGroup({ window: 1000 }))

    await t.start()

    expect((t as any).media_group).toBeDefined()

    await t.shutdown()
  })
})
