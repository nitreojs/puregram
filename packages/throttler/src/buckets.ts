/**
 * sliding-window bucket — keeps the timestamps of recent acquisitions and
 * decides whether a fresh `acquire` is allowed right now or has to wait until
 * the oldest in-window timestamp expires
 */
export interface SlidingWindow {
  /** record a successful acquisition at `now` */
  record: (now: number) => void
  /** ms the caller must sleep before the next acquire — 0 means "go now" */
  msUntilSlot: (now: number) => number
  /** drop expired timestamps relative to `now` */
  prune: (now: number) => void
  /** number of timestamps currently in the window */
  size: (now: number) => number
}

/** sliding window of size `limit` over `windowMs`. timestamps stored newest-last */
export function createWindow (limit: number, windowMs: number) {
  const stamps: number[] = []

  const prune = (now: number) => {
    const cutoff = now - windowMs
    let drop = 0

    while (drop < stamps.length) {
      const s = stamps[drop]

      if (s === undefined || s > cutoff) {
        break
      }

      drop++
    }

    if (drop > 0) {
      stamps.splice(0, drop)
    }
  }

  return {
    record (now: number) {
      stamps.push(now)
    },
    msUntilSlot (now: number) {
      prune(now)

      if (stamps.length < limit) {
        return 0
      }

      const oldest = stamps[0]

      if (oldest === undefined) {
        return 0
      }

      const wait = oldest + windowMs - now

      return wait > 0 ? wait : 0
    },
    prune,
    size (now: number) {
      prune(now)

      return stamps.length
    }
  }
}

/** registry of per-chat windows, lazily created and pruned on demand */
export class BucketRegistry {
  private readonly map = new Map<string, SlidingWindow>()

  constructor (
    private readonly limit: number,
    private readonly windowMs: number
  ) {}

  /** number of windows currently tracked */
  get count () {
    return this.map.size
  }

  get (key: string) {
    let w = this.map.get(key)

    if (w === undefined) {
      w = createWindow(this.limit, this.windowMs)
      this.map.set(key, w)
    }

    return w
  }

  /** drop windows whose timestamps have all expired — keeps memory bounded */
  sweep (now: number) {
    for (const [key, w] of this.map) {
      if (w.size(now) === 0) {
        this.map.delete(key)
      }
    }
  }
}
