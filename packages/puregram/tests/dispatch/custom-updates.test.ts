import { describe, it, expect } from 'vitest'

import { CustomUpdateRegistry, CustomUpdate } from '../../src/dispatch/custom-updates'

describe('CustomUpdateRegistry', () => {
  it('builds CustomUpdate from a registered kind', () => {
    const reg = new CustomUpdateRegistry()

    reg.define('job_done')
    const u = reg.build('job_done', { jobId: 'x', result: { ok: true } })

    expect(u).toBeInstanceOf(CustomUpdate)
    expect(u.kind).toBe('job_done')
    expect(u.raw).toEqual({ jobId: 'x', result: { ok: true } })
  })

  it('throws on emit for an undefined kind', () => {
    const reg = new CustomUpdateRegistry()

    expect(() => reg.build('nope', {})).toThrow(/not defined/)
  })

  it('CustomUpdate exposes payload fields via spread', () => {
    const reg = new CustomUpdateRegistry()

    reg.define('x')
    const u = reg.build('x', { a: 1, b: 'two' }) as any

    expect(u.a).toBe(1)
    expect(u.b).toBe('two')
  })
})
