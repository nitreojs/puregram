export class WaitForTimeout extends Error {
  readonly kind: string
  readonly timeout: number

  constructor (kind: string, timeout: number) {
    super(`waitFor('${kind}') timed out after ${timeout}ms`)

    this.kind = kind
    this.timeout = timeout
    this.name = 'WaitForTimeout'

    Error.captureStackTrace(this, this.constructor)
  }
}

export class WaitForCancelled extends Error {
  readonly kind: string

  constructor (kind: string) {
    super(`waitFor('${kind}') cancelled`)

    this.kind = kind
    this.name = 'WaitForCancelled'

    Error.captureStackTrace(this, this.constructor)
  }
}
