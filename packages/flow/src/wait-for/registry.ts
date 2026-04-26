import type { UpdateKindMap } from '@puregram/api'

import type { Waiter } from './waiter'

export class WaiterRegistry {
  // queue is heterogeneous over K — each kind owns its own queue of typed waiters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional erasure across update kinds
  private readonly queues = new Map<string, Waiter<any>[]>()

  register<K extends keyof UpdateKindMap> (waiter: Waiter<K>): void {
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

  size (kind: string): number {
    return this.queues.get(kind)?.length ?? 0
  }

  cancelAll (): void {
    for (const queue of this.queues.values()) {
      for (const waiter of queue) {
        waiter.cancel()
      }
    }

    this.queues.clear()
  }

  // strip already-settled waiters (timed out, externally cancelled) from a kind's queue.
  // uses the public Waiter.settled accessor — no structural casts.
  private evictSettled (kind: string): void {
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
