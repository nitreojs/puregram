interface Scheduled {
  id: number
  fireAt: number
  intervalMs: number | undefined
  callback: (...args: unknown[]) => void
  args: unknown[]
  cleared: boolean
}

interface Globals {
  Date: typeof Date
  setTimeout: typeof setTimeout
  clearTimeout: typeof clearTimeout
  setInterval: typeof setInterval
  clearInterval: typeof clearInterval
}

/**
 * controls returned by `installTestClock` — call `advance` to move virtual time forward
 * and fire any due timers, or `restore` to put the original globals back
 */
export interface TestClock {
  /**
   * move the virtual clock forward by `ms` milliseconds, firing any timers whose
   * `fireAt` falls inside the window. interval timers re-arm after each fire and
   * may fire multiple times in a single `advance` call
   */
  advance: (ms: number) => Promise<void>

  /**
   * the current virtual unix-ms timestamp (same value `Date.now()` would return
   * while the clock is installed)
   */
  now: () => number

  /**
   * uninstall the clock and restore the real `Date.now` / `setTimeout` / `setInterval`
   */
  restore: () => void
}

const ORIGINALS_KEY = Symbol.for('@puregram/test/clock-originals')

interface GlobalWithKey {
  [ORIGINALS_KEY]?: Globals
}

function captureOriginals () {
  const g = globalThis as GlobalWithKey
  const cached = g[ORIGINALS_KEY]

  if (cached !== undefined) {
    return cached
  }

  const originals: Globals = {
    Date: globalThis.Date,
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
    setInterval: globalThis.setInterval,
    clearInterval: globalThis.clearInterval
  }

  g[ORIGINALS_KEY] = originals

  return originals
}

/**
 * install a virtual clock on `globalThis`. all callers of `Date.now()`,
 * `setTimeout(...)` and `setInterval(...)` will be served from the virtual clock
 * until `restore()` is called
 *
 * `startMs` defaults to the current real time so existing code that has already
 * stamped timestamps before installation stays consistent
 */
export function installTestClock (startMs: number = Date.now()) {
  const originals = captureOriginals()
  const timers = new Map<number, Scheduled>()
  let nowMs = startMs
  let nextId = 1

  function schedule (
    callback: (...args: unknown[]) => void,
    delayMs: number,
    args: unknown[],
    intervalMs: number | undefined
  ) {
    const id = nextId
    const safeDelay = Number.isFinite(delayMs) && delayMs > 0 ? delayMs : 0

    nextId += 1

    timers.set(id, {
      id,
      fireAt: nowMs + safeDelay,
      intervalMs,
      callback,
      args,
      cleared: false
    })

    return id
  }

  // node returns a Timeout object; tests typically inspect only the numeric id
  function makeHandle (id: number) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return id as unknown as NodeJS.Timeout
  }

  function handleToId (handle: unknown) {
    if (typeof handle === 'number') {
      return handle
    }

    if (typeof handle === 'object' && handle !== null && 'id' in handle) {
      const candidate = (handle as { id: unknown }).id

      if (typeof candidate === 'number') {
        return candidate
      }
    }

    return undefined
  }

  const fakeSetTimeout = ((cb: (...args: unknown[]) => void, ms?: number, ...rest: unknown[]) => {
    const id = schedule(cb, ms ?? 0, rest, undefined)

    return makeHandle(id)
  }) as unknown as typeof setTimeout

  const fakeClearTimeout = ((handle: unknown) => {
    const id = handleToId(handle)

    if (id === undefined) {
      return
    }

    const t = timers.get(id)

    if (t !== undefined) {
      t.cleared = true
      timers.delete(id)
    }
  }) as unknown as typeof clearTimeout

  const fakeSetInterval = ((cb: (...args: unknown[]) => void, ms?: number, ...rest: unknown[]) => {
    const interval = ms ?? 0
    const id = schedule(cb, interval, rest, interval)

    return makeHandle(id)
  }) as unknown as typeof setInterval

  const fakeClearInterval = fakeClearTimeout as unknown as typeof clearInterval

  class FakeDate extends originals.Date {
    constructor (...args: unknown[]) {
      if (args.length === 0) {
        super(nowMs)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        super(...(args as [number]))
      }
    }

    static now () {
      return nowMs
    }
  }

  FakeDate.parse = originals.Date.parse.bind(originals.Date)
  FakeDate.UTC = originals.Date.UTC.bind(originals.Date)

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  globalThis.Date = FakeDate as unknown as DateConstructor
  globalThis.setTimeout = fakeSetTimeout
  globalThis.clearTimeout = fakeClearTimeout
  globalThis.setInterval = fakeSetInterval
  globalThis.clearInterval = fakeClearInterval

  async function advance (ms: number) {
    if (!Number.isFinite(ms) || ms < 0) {
      throw new Error('advance: ms must be a finite non-negative number')
    }

    const target = nowMs + ms

    // fire earliest-due timer until none are due — supports interval re-arming
    // and timers that schedule further timers from inside callbacks
    for (;;) {
      let next: Scheduled | undefined

      for (const t of timers.values()) {
        if (t.cleared) {
          continue
        }

        if (t.fireAt > target) {
          continue
        }

        if (next === undefined || t.fireAt < next.fireAt) {
          next = t
        }
      }

      if (next === undefined) {
        break
      }

      nowMs = next.fireAt

      if (next.intervalMs === undefined) {
        timers.delete(next.id)
      } else {
        next.fireAt += next.intervalMs
      }

      const result = next.callback(...next.args) as unknown

      if (result instanceof Promise) {
        await result
      }
    }

    nowMs = target

    // flush microtasks so awaiters of promises resolved inside callbacks observe the new state
    await Promise.resolve()
  }

  function restore () {
    globalThis.Date = originals.Date
    globalThis.setTimeout = originals.setTimeout
    globalThis.clearTimeout = originals.clearTimeout
    globalThis.setInterval = originals.setInterval
    globalThis.clearInterval = originals.clearInterval
  }

  return {
    advance,
    now: () => nowMs,
    restore
  }
}
