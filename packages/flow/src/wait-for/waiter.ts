import type { UpdateKindMap } from '@puregram/api'

import { WaitForCancelled, WaitForTimeout } from '../errors'

import type { Filter, WaitForOptions } from './types'

export class Waiter<K extends keyof UpdateKindMap> {
  readonly kind: K
  readonly consume: boolean
  readonly promise: Promise<UpdateKindMap[K] | null>

  private readonly filterFn: Filter<UpdateKindMap[K]> | undefined
  private resolveFn!: (value: UpdateKindMap[K] | null) => void
  private rejectFn!: (reason: unknown) => void
  private timer: ReturnType<typeof setTimeout> | undefined
  private settledFlag = false

  constructor (kind: K, options: WaitForOptions<K>) {
    this.kind = kind
    this.consume = options.consume ?? true
    this.filterFn = options.filter

    this.promise = new Promise<UpdateKindMap[K] | null>((resolve, reject) => {
      this.resolveFn = resolve
      this.rejectFn = reject
    })

    if (options.timeout !== undefined) {
      const ms = options.timeout

      this.timer = setTimeout(() => {
        if (this.settledFlag) {
          return
        }

        this.settledFlag = true

        if (options.nullOnTimeout === true) {
          this.resolveFn(null)
        } else {
          this.rejectFn(new WaitForTimeout(kind, ms))
        }
      }, ms)
    }
  }

  // true once the waiter has resolved, rejected, or timed out — registry uses this to evict
  get settled (): boolean {
    return this.settledFlag
  }

  match (update: UpdateKindMap[K]): boolean {
    if (this.filterFn === undefined) {
      return true
    }

    return this.filterFn(update)
  }

  resolve (update: UpdateKindMap[K]): void {
    if (this.settledFlag) {
      return
    }

    this.settledFlag = true

    if (this.timer !== undefined) {
      clearTimeout(this.timer)
    }

    this.resolveFn(update)
  }

  cancel (): void {
    if (this.settledFlag) {
      return
    }

    this.settledFlag = true

    if (this.timer !== undefined) {
      clearTimeout(this.timer)
    }

    this.rejectFn(new WaitForCancelled(this.kind))
  }
}
