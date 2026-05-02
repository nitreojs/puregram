import { scenes } from '@puregram/scenes'
import { session } from '@puregram/session'
import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../../src'

import '../../src/plugins/scenes'
import '../../src/plugins/session'

describe('@puregram/test/scenes', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('current(user) returns null before any scene is entered', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
      .extend(session())
      .extend(scenes())
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()

    expect(await env.scenes!.current(alice)).toBeNull()
  })

  it('enter(user, sceneId) seeds the active scene', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
      .extend(session())
      .extend(scenes())
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()

    await env.scenes!.enter(alice, 'register')

    const current = await env.scenes!.current(alice)

    expect(current?.sceneId).toBe('register')
    expect(current?.step).toBe(0)
    expect(current?.payload).toBeUndefined()
  })

  it('enter accepts step + payload and current reflects them', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
      .extend(session())
      .extend(scenes())
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()

    await env.scenes!.enter(alice, 'register', { step: 2, payload: { name: 'Alice' } })

    const current = await env.scenes!.current(alice)

    expect(current?.sceneId).toBe('register')
    expect(current?.step).toBe(2)
    expect(current?.payload).toEqual({ name: 'Alice' })
  })

  it('leave(user) clears scene state', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
      .extend(session())
      .extend(scenes())
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()

    await env.scenes!.enter(alice, 'register')
    await env.scenes!.leave(alice)

    expect(await env.scenes!.current(alice)).toBeNull()
  })

  it('history(user) tracks every enter in order', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
      .extend(session())
      .extend(scenes())
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()

    expect(env.scenes!.history(alice)).toEqual([])

    await env.scenes!.enter(alice, 'register')
    await env.scenes!.enter(alice, 'profile', { step: 1 })

    const history = env.scenes!.history(alice)

    expect(history).toHaveLength(2)
    expect(history[0]?.sceneId).toBe('register')
    expect(history[0]?.step).toBe(0)
    expect(history[1]?.sceneId).toBe('profile')
    expect(history[1]?.step).toBe(1)
    expect(typeof history[0]?.enteredAt).toBe('number')
  })
})
