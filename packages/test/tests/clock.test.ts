import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { installTestClock } from '../src/clock'
import { createTestEnv } from '../src/index'

describe('time-travel clock', () => {
  let cleanup: (() => Promise<void> | void) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('installTestClock advances Date.now and fires setTimeout callbacks', async () => {
    const clock = installTestClock(1_000_000)

    cleanup = () => clock.restore()

    let fired = false

    setTimeout(() => {
      fired = true
    }, 3_600_000)

    expect(Date.now()).toBe(1_000_000)
    expect(fired).toBe(false)

    await clock.advance(3_600_000)

    expect(fired).toBe(true)
    expect(Date.now()).toBe(4_600_000)
  })

  it('setInterval re-arms and fires multiple times in one advance', async () => {
    const clock = installTestClock()

    cleanup = () => clock.restore()

    let ticks = 0
    const handle = setInterval(() => {
      ticks += 1
    }, 1000)

    await clock.advance(3500)
    expect(ticks).toBe(3)

    clearInterval(handle)

    await clock.advance(5000)
    expect(ticks).toBe(3)
  })

  it('clearTimeout cancels a scheduled callback', async () => {
    const clock = installTestClock()

    cleanup = () => clock.restore()

    let fired = false
    const handle = setTimeout(() => {
      fired = true
    }, 1000)

    clearTimeout(handle)
    await clock.advance(5000)
    expect(fired).toBe(false)
  })

  it('env.advanceTime exposes a clean API and unwinds on shutdown', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const realSetTimeout = globalThis.setTimeout

    // touch advanceTime(0) first to install the clock, then schedule
    await env.advanceTime(0)

    expect(globalThis.setTimeout).not.toBe(realSetTimeout)

    let fired = false

    setTimeout(() => {
      fired = true
    }, 60 * 60 * 1000)

    await env.advanceTime(3_600_000)

    expect(fired).toBe(true)

    // after shutdown the real setTimeout / Date.now should be back
    await env.shutdown()
    cleanup = undefined

    expect(globalThis.setTimeout).toBe(realSetTimeout)
  })
})
