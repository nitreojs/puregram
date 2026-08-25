import type { UpdateKindMap } from '@puregram/api'

import type { Waiter } from './waiter'

export type MatchOutcome<K extends keyof UpdateKindMap> =
  | { outcome: 'none' }
  | { outcome: 'rejected', feedback: string | undefined }
  | { outcome: 'matched', waiter: Waiter<K> }

export class WaiterRegistry {
  // queue is heterogeneous over K — each kind owns its own queue of typed waiters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional erasure across update kinds
  private readonly queues = new Map<string, Waiter<any>[]>()

  register<K extends keyof UpdateKindMap, T> (waiter: Waiter<K, T>) {
    const queue = this.queues.get(waiter.kind as string)

    if (queue) {
      queue.push(waiter)
    } else {
      this.queues.set(waiter.kind as string, [waiter])
    }
  }

  match<K extends keyof UpdateKindMap> (kind: K, update: UpdateKindMap[K]): Waiter<K> | undefined {
    const queue = this.queues.get(kind as string)

    if (!queue || queue.length === 0) {
      return undefined
    }

    this.evictSettled(kind as string)

    const live = this.queues.get(kind as string)

    if (!live || live.length === 0) {
      return undefined
    }

    for (let i = 0; i < live.length; i++) {
      const candidate = live[i] as Waiter<K>

      if (candidate.match(update)) {
        live.splice(i, 1)

        if (live.length === 0) {
          this.queues.delete(kind as string)
        }

        return candidate
      }
    }

    return undefined
  }

  // a reject leaves every waiter armed, and reports feedback only from one whose filter accepted
  // eslint-disable-next-line local-rules/no-redundant-return-type -- discriminated outcome documents the contract
  matchOrPeek<K extends keyof UpdateKindMap> (kind: K, update: UpdateKindMap[K]): MatchOutcome<K> {
    const queue = this.queues.get(kind as string)

    if (!queue || queue.length === 0) {
      return { outcome: 'none' }
    }

    this.evictSettled(kind as string)

    const live = this.queues.get(kind as string)

    if (!live || live.length === 0) {
      return { outcome: 'none' }
    }

    let feedback: string | undefined

    for (let i = 0; i < live.length; i++) {
      const candidate = live[i] as Waiter<K>

      if (candidate.match(update)) {
        live.splice(i, 1)

        if (live.length === 0) {
          this.queues.delete(kind as string)
        }

        return { outcome: 'matched', waiter: candidate }
      }

      feedback ??= candidate.lastValidationFeedback
    }

    return { outcome: 'rejected', feedback }
  }

  size (kind: string) {
    return this.queues.get(kind)?.length ?? 0
  }

  cancelAll () {
    for (const queue of this.queues.values()) {
      for (const waiter of queue) {
        waiter.cancel()
      }
    }

    this.queues.clear()
  }

  // strip settled waiters (timed out / cancelled) from the kind's queue
  private evictSettled (kind: string) {
    const queue = this.queues.get(kind)

    if (!queue) {
      return
    }

    const live = queue.filter(w => !w.settled)

    if (live.length === 0) {
      this.queues.delete(kind)
    } else if (live.length !== queue.length) {
      this.queues.set(kind, live)
    }
  }
}
