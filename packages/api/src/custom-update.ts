import type { Update, UpdateKind, UpdateKindMap } from './generated/updates'

/**
 * runtime container for plugin-emitted custom update kinds — constructed by
 * `tg.emit(name, payload)` and routed through the same dispatch chain as bot-api
 * updates. payload fields are spread onto `this` so handlers can read `update.jobId`
 * directly without `update.raw`
 */
export class CustomUpdate<N extends string = string, P extends Record<string, unknown> = Record<string, unknown>> {
  readonly kind: N
  readonly raw: P

  constructor (kind: N, raw: P) {
    this.kind = kind
    this.raw = raw
    Object.assign(this, raw)
  }

  is<K extends UpdateKind> (kind: K): this is UpdateKindMap[K] {
    return (this.kind as string) === kind
  }
}

/** registry of declared custom-update kinds — throws on `build()` if the name wasn't declared first */
export class CustomUpdateRegistry {
  private readonly defined = new Set<string>()

  define (kind: string) {
    this.defined.add(kind)
  }

  has (kind: string): boolean {
    return this.defined.has(kind)
  }

  build (kind: string, payload: Record<string, unknown>) {
    if (!this.defined.has(kind)) {
      throw new Error(`custom update kind '${kind}' is not defined; call tg.defineUpdate('${kind}') first`)
    }

    return new CustomUpdate(kind, payload)
  }
}

/** every update a `tg.on(...)` handler can see — bot-api wrapped updates plus any user-defined `CustomUpdate` */
export type AnyUpdate = Update | CustomUpdate
