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

/**
 * thrown when a waiter is aborted via its `AbortSignal`. carries the signal's
 * `reason` (if any) under `cause` to mirror the standard AbortController contract
 */
export class WaiterAbortedError extends Error {
  readonly kind: string

  constructor (kind: string, reason?: unknown) {
    super(`waitFor('${kind}') aborted`)

    this.kind = kind
    this.name = 'WaiterAbortedError'

    if (reason !== undefined) {
      ;(this as { cause?: unknown }).cause = reason
    }

    Error.captureStackTrace(this, this.constructor)
  }
}

export class FlowPersistenceUnconfigured extends Error {
  constructor () {
    super('flow.prompt({ id }) / flow.waitFor({ id }) requires flow({ storage })')

    this.name = 'FlowPersistenceUnconfigured'

    Error.captureStackTrace(this, this.constructor)
  }
}

export class FlowHandlerMissing extends Error {
  readonly id: string

  constructor (id: string) {
    super(`no flow.handle registered for id '${id}'`)

    this.id = id
    this.name = 'FlowHandlerMissing'

    Error.captureStackTrace(this, this.constructor)
  }
}

export class FlowKindMismatch extends Error {
  readonly id: string
  readonly expectedKind: string
  readonly actualKind: string

  constructor (id: string, expectedKind: string, actualKind: string) {
    super(`flow.handle('${id}') registered for kind '${expectedKind}' but call site used kind '${actualKind}'`)

    this.id = id
    this.expectedKind = expectedKind
    this.actualKind = actualKind
    this.name = 'FlowKindMismatch'

    Error.captureStackTrace(this, this.constructor)
  }
}

export class FlowChatIdNotNumeric extends Error {
  readonly received: string

  constructor (received: string) {
    super(`flow.prompt requires a numeric chat id (got ${received})`)

    this.received = received
    this.name = 'FlowChatIdNotNumeric'

    Error.captureStackTrace(this, this.constructor)
  }
}
