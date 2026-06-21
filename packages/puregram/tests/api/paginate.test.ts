import { describe, it, expect, vi } from 'vitest'

import { cursorPaginator, offsetPaginator } from '../../src/api/paginate'
import { Telegram } from '../../src/telegram'

describe('offsetPaginator', () => {
  it('pages until a short page and yields items in order', async () => {
    const all = [1, 2, 3, 4, 5]
    const fetchPage = vi.fn((offset: number, limit: number) =>
      Promise.resolve({ items: all.slice(offset, offset + limit), total: all.length })
    )

    const out: number[] = []

    for await (const item of offsetPaginator(fetchPage, 0, 2)) {
      out.push(item)
    }

    expect(out).toEqual([1, 2, 3, 4, 5])
    // 0-1, 2-3, then 4 (short page → stop) = 3 calls
    expect(fetchPage).toHaveBeenCalledTimes(3)
  })

  it('stops on an empty page when the previous one was full', async () => {
    const all = [1, 2, 3, 4]
    const fetchPage = vi.fn((offset: number, limit: number) =>
      Promise.resolve({ items: all.slice(offset, offset + limit), total: all.length })
    )

    const out: number[] = []

    for await (const item of offsetPaginator(fetchPage, 0, 2)) {
      out.push(item)
    }

    expect(out).toEqual([1, 2, 3, 4])
    // 0-1, 2-3 (both full), then empty → stop = 3 calls
    expect(fetchPage).toHaveBeenCalledTimes(3)
  })

  it('collect() returns the items with the reported total', async () => {
    const all = ['a', 'b', 'c']
    const fetchPage = (offset: number, limit: number) =>
      Promise.resolve({ items: all.slice(offset, offset + limit), total: all.length })

    const result = await offsetPaginator(fetchPage, 0, 2).collect()

    expect([...result]).toEqual(['a', 'b', 'c'])
    expect(result.total).toBe(3)
  })
})

describe('cursorPaginator', () => {
  it('follows next_offset until it empties', async () => {
    const pages: Record<string, { items: number[], next: string | undefined }> = {
      '': { items: [1, 2], next: 'p1' },
      p1: { items: [3, 4], next: 'p2' },
      p2: { items: [5], next: undefined }
    }

    const fetchPage = vi.fn((offset: string) => {
      const page = pages[offset]

      return Promise.resolve({ items: page?.items ?? [], total: 5, next: page?.next })
    })

    const out: number[] = []

    for await (const item of cursorPaginator(fetchPage, '', 2)) {
      out.push(item)
    }

    expect(out).toEqual([1, 2, 3, 4, 5])
    expect(fetchPage).toHaveBeenCalledTimes(3)
  })

  it('collect() includes the total', async () => {
    const fetchPage = (offset: string) =>
      Promise.resolve(offset === ''
        ? { items: ['x', 'y'], total: 2, next: undefined }
        : { items: [], total: 2, next: undefined })

    const result = await cursorPaginator(fetchPage, '', 50).collect()

    expect([...result]).toEqual(['x', 'y'])
    expect(result.total).toBe(2)
  })
})

describe('tg.iter* wiring', () => {
  it('iterUserProfilePhotos maps photos + total_count from the api response', async () => {
    const responses = [
      { ok: true, result: { total_count: 3, photos: [[{ file_id: 'a' }], [{ file_id: 'b' }]] } },
      { ok: true, result: { total_count: 3, photos: [[{ file_id: 'c' }]] } }
    ]
    let index = 0
    const request = vi.fn(() => Promise.resolve({ status: 200, json: () => Promise.resolve(responses[index++]) }))
    const tg = new Telegram({ token: 'X', httpClient: { request } })

    const photos = await tg.iterUserProfilePhotos(1, { limit: 2 }).collect()

    expect(photos).toHaveLength(3)
    expect(photos.total).toBe(3)
    expect(request).toHaveBeenCalledTimes(2)
  })
})
