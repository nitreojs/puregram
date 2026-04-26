export class CustomUpdate<N extends string = string, P extends Record<string, unknown> = Record<string, unknown>> {
  readonly kind: N
  readonly raw: P

  constructor (kind: N, raw: P) {
    this.kind = kind
    this.raw = raw
    Object.assign(this, raw)
  }
}

export class CustomUpdateRegistry {
  private readonly defined = new Set<string>()

  define (kind: string): void {
    this.defined.add(kind)
  }

  has (kind: string): boolean {
    return this.defined.has(kind)
  }

  build (kind: string, payload: Record<string, unknown>): CustomUpdate {
    if (!this.defined.has(kind)) {
      throw new Error(`custom update kind '${kind}' is not defined; call tg.defineUpdate('${kind}') first`)
    }
    return new CustomUpdate(kind, payload)
  }
}
