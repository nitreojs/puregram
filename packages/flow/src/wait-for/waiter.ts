import type { UpdateKindMap } from '@puregram/api'

import { WaitForCancelled, WaitForTimeout } from '../errors'

import type { Filter, WaitForOptions } from './types'

export class Waiter<K extends keyof UpdateKindMap, T = UpdateKindMap[K]> {
  readonly kind: K
  readonly consume: boolean
  readonly promise: Promise<T | null>

  /** last truthy string returned by `validate` — consumed by the matcher to send feedback */
  lastValidationFeedback: string | undefined

  private readonly filterFn: Filter<UpdateKindMap[K]> | undefined
  private readonly validateFn: WaitForOptions<K, T>['validate']
  private readonly transformFn: WaitForOptions<K, T>['transform']
  private resolveFn!: (value: T | null) => void
  private rejectFn!: (reason: unknown) => void
  private timer: ReturnType<typeof setTimeout> | undefined
  private settledFlag = false

  constructor (kind: K, options: WaitForOptions<K, T>) {
    this.kind = kind
    this.consume = options.consume ?? true
    this.filterFn = options.filter
    this.validateFn = options.validate
    this.transformFn = options.transform

    this.promise = new Promise<T | null>((resolve, reject) => {
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

  get settled () {
    return this.settledFlag
  }

  match (update: UpdateKindMap[K]) {
    if (this.filterFn !== undefined && !this.filterFn(update)) {
      return false
    }

    if (this.validateFn === undefined) {
      this.lastValidationFeedback = undefined

      return true
    }

    const result = this.validateFn(update)

    if (result === true) {
      this.lastValidationFeedback = undefined

      return true
    }

    this.lastValidationFeedback = typeof result === 'string' ? result : undefined

    return false
  }

  resolve (update: UpdateKindMap[K]) {
    if (this.settledFlag) {
      return
    }

    this.settledFlag = true

    if (this.timer !== undefined) {
      clearTimeout(this.timer)
    }

    const value = this.transformFn !== undefined
      ? this.transformFn(update)
      : (update as unknown as T)

    this.resolveFn(value)
  }

  cancel () {
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
