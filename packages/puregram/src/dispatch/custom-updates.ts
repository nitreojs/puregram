import type { UpdateKind, UpdateKindMap } from '@puregram/api'

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
