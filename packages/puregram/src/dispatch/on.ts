// handlers compose middleware-style. each handler receives the update and a `next`
// thunk; calling `next()` lets the next registered handler run, returning without
// calling `next()` halts the chain. that lets command-style handlers terminate
// after matching, and lets cross-cutting handlers (logging, metrics) explicitly
// pass through. order of registration is the order of execution
export type UpdateHandler<U = unknown> = (
  update: U,
  next: () => Promise<void>
) => unknown

interface KindLike {
 kind: string
}

export class Dispatcher {
  private readonly handlers = new Map<string, UpdateHandler[]>()

  on (kind: string, fn: UpdateHandler) {
    const list = this.handlers.get(kind)

    if (list) {
      list.push(fn)
    } else {
      this.handlers.set(kind, [fn])
    }
  }

  off (kind: string, fn: UpdateHandler) {
    const list = this.handlers.get(kind)

    if (!list) {
      return
    }

    const idx = list.indexOf(fn)

    if (idx >= 0) {
      list.splice(idx, 1)
    }

    if (list.length === 0) {
      this.handlers.delete(kind)
    }
  }

  async runUserHandlers (update: KindLike) {
    const list = this.handlers.get(update.kind)

    if (!list) {
      return
    }

    // snapshot the list so off() during dispatch can't shift the cursor
    const snapshot = [...list]
    let i = 0

    const next = async (): Promise<void> => {
      if (i >= snapshot.length) {
        return
      }

      const handler = snapshot[i++]

      if (handler === undefined) {
        return
      }

      await handler(update, next)
    }

    await next()
  }

  has (kind: string): boolean {
    return this.handlers.has(kind)
  }
}
