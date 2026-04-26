export type UpdateHandler<U = unknown> = (update: U) => unknown | Promise<unknown>

interface KindLike { kind: string }

export class Dispatcher {
  private readonly handlers = new Map<string, UpdateHandler[]>()

  on (kind: string, fn: UpdateHandler): void {
    const list = this.handlers.get(kind)
    if (list) list.push(fn)
    else this.handlers.set(kind, [fn])
  }

  off (kind: string, fn: UpdateHandler): void {
    const list = this.handlers.get(kind)
    if (!list) return
    const idx = list.indexOf(fn)
    if (idx >= 0) list.splice(idx, 1)
    if (list.length === 0) this.handlers.delete(kind)
  }

  async runUserHandlers (update: KindLike): Promise<void> {
    const list = this.handlers.get(update.kind)
    if (!list) return
    for (const handler of list) {
      await handler(update)
    }
  }

  has (kind: string): boolean {
    return this.handlers.has(kind)
  }
}
