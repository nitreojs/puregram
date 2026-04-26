import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { createDebug } from '../src/debug'

describe('createDebug', () => {
  let prevEnv: string | undefined
  let stderr: string[]

  beforeEach(() => {
    prevEnv = process.env.PUREGRAM_DEBUG
    stderr = []
    vi.spyOn(process.stderr, 'write').mockImplementation((chunk: any) => {
      stderr.push(String(chunk))

      return true
    })
  })

  afterEach(() => {
    process.env.PUREGRAM_DEBUG = prevEnv
    vi.restoreAllMocks()
  })

  it('does nothing when env is unset', () => {
    delete process.env.PUREGRAM_DEBUG
    const log = createDebug('puregram:api')

    log('hello %s', 'world')
    expect(stderr).toHaveLength(0)
  })

  it('writes when env matches namespace', () => {
    process.env.PUREGRAM_DEBUG = 'puregram:api'
    const log = createDebug('puregram:api')

    log('hello %s', 'world')
    expect(stderr.join('')).toContain('puregram:api')
    expect(stderr.join('')).toContain('hello world')
  })

  it('matches via wildcard', () => {
    process.env.PUREGRAM_DEBUG = 'puregram:*'
    const log = createDebug('puregram:updates')

    log('x')
    expect(stderr.join('')).toContain('x')
  })

  it('extends namespace', () => {
    process.env.PUREGRAM_DEBUG = 'puregram:api:*'
    const log = createDebug('puregram:api')
    const ext = log.extend('sendMessage')

    ext('called')
    expect(stderr.join('')).toContain('puregram:api:sendMessage')
  })
})
