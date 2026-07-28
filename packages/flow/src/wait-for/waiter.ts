import type { UpdateKindMap } from '@puregram/api'

import { WaiterAbortedError, WaitForCancelled, WaitForTimeout } from '../errors'

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
  private signal: AbortSignal | undefined
  private abortHandler: (() => void) | undefined

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
        this.detachSignal()

        if (options.nullOnTimeout === true) {
          this.resolveFn(null)
        } else {
          this.rejectFn(new WaitForTimeout(kind, ms))
        }
      }, ms)
    }

    if (options.signal !== undefined) {
      this.attachSignal(options.signal)
    }
  }

  get settled () {
    return this.settledFlag
  }

  /** does the filter accept this update — kept apart from `validate` so the matcher can skip other chats' waiters */
  accepts (update: UpdateKindMap[K]) {
    return this.filterFn === undefined || this.filterFn(update)
  }

  /** run `validate` for an update the filter already accepted — stashes string feedback for the matcher */
  validate (update: UpdateKindMap[K]) {
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

    this.detachSignal()

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

    this.detachSignal()

    this.rejectFn(new WaitForCancelled(this.kind))
  }

  private attachSignal (signal: AbortSignal) {
    this.signal = signal

    if (signal.aborted) {
      // settle synchronously so the caller's await sees the rejection immediately
      this.settledFlag = true

      if (this.timer !== undefined) {
        clearTimeout(this.timer)
      }

      this.rejectFn(new WaiterAbortedError(this.kind, signal.reason))

      return
    }

    this.abortHandler = () => {
      if (this.settledFlag) {
        return
      }

      this.settledFlag = true

      if (this.timer !== undefined) {
        clearTimeout(this.timer)
      }

      this.detachSignal()

      this.rejectFn(new WaiterAbortedError(this.kind, signal.reason))
    }

    signal.addEventListener('abort', this.abortHandler, { once: true })
  }

  private detachSignal () {
    if (this.signal !== undefined && this.abortHandler !== undefined) {
      this.signal.removeEventListener('abort', this.abortHandler)
      this.signal = undefined
      this.abortHandler = undefined
    }
  }
}
