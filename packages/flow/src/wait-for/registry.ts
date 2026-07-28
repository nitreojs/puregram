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

  // scans the whole live queue rather than its head: waiters armed in unrelated chats share the
  // per-kind queue and must be allowed to decline the update. the first waiter whose filter accepts
  // owns it — a validate failure there surfaces feedback and leaves that waiter armed
  // eslint-disable-next-line local-rules/no-redundant-return-type -- discriminated outcome documents the contract
  match<K extends keyof UpdateKindMap> (kind: K, update: UpdateKindMap[K]): MatchOutcome<K> {
    this.evictSettled(kind as string)

    const live = this.queues.get(kind as string)

    if (live === undefined || live.length === 0) {
      return { outcome: 'none' }
    }

    for (let i = 0; i < live.length; i++) {
      const candidate = live[i] as Waiter<K>

      if (!candidate.accepts(update)) {
        continue
      }

      if (!candidate.validate(update)) {
        return { outcome: 'rejected', feedback: candidate.lastValidationFeedback }
      }

      live.splice(i, 1)

      if (live.length === 0) {
        this.queues.delete(kind as string)
      }

      return { outcome: 'matched', waiter: candidate }
    }

    return { outcome: 'none' }
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
