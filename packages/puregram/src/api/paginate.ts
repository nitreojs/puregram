/** an array of paginated results, augmented with the total telegram reported (absent for some endpoints) */
export type Paginated<T> = T[] & { total: number | undefined }

/** async iterator over paginated results; `collect()` drains the rest into a {@link Paginated} array */
export interface PageIterator<T> extends AsyncIterableIterator<T> {
  collect: () => Promise<Paginated<T>>
}

interface OffsetPage<T> {
  items: T[]
  total: number | undefined
}

interface CursorPage<T> {
  items: T[]
  total: number | undefined
  next: string | undefined
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- name the PageIterator return type
function withCollect<T> (gen: AsyncGenerator<T>, getTotal: () => number | undefined): PageIterator<T> {
  const collect = async () => {
    const items: T[] = []

    for await (const item of gen) {
      items.push(item)
    }

    return Object.assign(items, { total: getTotal() })
  }

  return Object.assign(gen, { collect })
}

/** auto-page a numeric offset/limit endpoint, yielding items until a short or empty page */
export function offsetPaginator<T> (
  fetchPage: (offset: number, limit: number) => Promise<OffsetPage<T>>,
  startOffset = 0,
  limit = 100
) {
  let total: number | undefined

  async function * generate () {
    let offset = startOffset

    while (true) {
      const page = await fetchPage(offset, limit)

      total = page.total

      for (const item of page.items) {
        yield item
      }

      if (page.items.length === 0 || page.items.length < limit) {
        break
      }

      offset += page.items.length
    }
  }

  return withCollect(generate(), () => total)
}

/** auto-page a string-cursor endpoint (telegram `next_offset`), yielding items until the cursor empties */
export function cursorPaginator<T> (
  fetchPage: (offset: string, limit: number) => Promise<CursorPage<T>>,
  startOffset = '',
  limit = 100
) {
  let total: number | undefined

  async function * generate () {
    let offset = startOffset

    while (true) {
      const page = await fetchPage(offset, limit)

      total = page.total

      for (const item of page.items) {
        yield item
      }

      if (page.items.length === 0 || page.next === undefined || page.next === '') {
        break
      }

      offset = page.next
    }
  }

  return withCollect(generate(), () => total)
}
