import { describe, expect, it } from 'vitest'

import { SceneManager } from '../src/manager'

const fakeScene = (slug: string) => ({
  slug,
  enterHandler: () => {},
  leaveHandler: () => {}
})

describe('SceneManager', () => {
  it('starts empty', () => {
    const m = new SceneManager()

    expect(m.has('foo')).toBe(false)
    expect(m.all()).toEqual([])
  })

  it('add stores by slug', () => {
    const m = new SceneManager()
    const a = fakeScene('a')

    m.add(a)
    expect(m.has('a')).toBe(true)
    expect(m.get('a')).toBe(a)
  })

  it('add throws on duplicate slug', () => {
    const m = new SceneManager()

    m.add(fakeScene('a'))
    expect(() => m.add(fakeScene('a'))).toThrow(/already/)
  })

  it('strictGet returns the scene by slug', () => {
    const m = new SceneManager()
    const a = fakeScene('a')

    m.add(a)
    expect(m.strictGet('a')).toBe(a)
  })

  it('strictGet throws on missing slug', () => {
    const m = new SceneManager()

    expect(() => m.strictGet('missing')).toThrow(/not found/)
  })

  it('remove drops the scene and returns true', () => {
    const m = new SceneManager()

    m.add(fakeScene('a'))
    expect(m.remove('a')).toBe(true)
    expect(m.has('a')).toBe(false)
  })

  it('remove returns false on missing slug', () => {
    const m = new SceneManager()

    expect(m.remove('missing')).toBe(false)
  })

  it('all returns scenes in insertion order', () => {
    const m = new SceneManager()

    m.add(fakeScene('a'))
    m.add(fakeScene('b'))
    m.add(fakeScene('c'))
    expect(m.all().map(s => s.slug)).toEqual(['a', 'b', 'c'])
  })

  it('constructor seed populates the registry', () => {
    const a = fakeScene('a')
    const b = fakeScene('b')
    const m = new SceneManager({ scenes: [a, b] })

    expect(m.has('a')).toBe(true)
    expect(m.has('b')).toBe(true)
  })

  it('constructor seed throws on duplicate', () => {
    expect(() => new SceneManager({ scenes: [fakeScene('a'), fakeScene('a')] })).toThrow()
  })
})
