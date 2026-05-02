export type HookPriority = 'high' | 'normal' | 'low'

export interface RequestContext {
  method: string
  params: Record<string, unknown> | undefined
  url?: string
  init?: RequestInit
  response?: { status: number }
  json?: unknown
}

export type ErrorContext = Partial<RequestContext>

export type Middleware<C> = (ctx: C, next: () => Promise<void>) => unknown
export type ErrorHandler = (err: Error, ctx: ErrorContext) => Error | void | Promise<Error | void>

export interface DispatchErrorContext {
  /** the raw update payload that failed to dispatch, as received from telegram */
  raw: Record<string, unknown>
}

export type DispatchErrorHandler = (err: Error, ctx: DispatchErrorContext) => unknown

export interface HookOptions {
  priority?: HookPriority
}

export type RequestHookName =
  | 'onBeforeRequest'
  | 'onRequestIntercept'
  | 'onResponseIntercept'
  | 'onAfterRequest'

export type LifecycleHookName = 'onInit' | 'onShutdown'

interface Bucket<C> {
  high: Middleware<C>[]
  normal: Middleware<C>[]
  low: Middleware<C>[]
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- C is consumed only via the return type
const newBucket = <C>(): Bucket<C> => ({ high: [], normal: [], low: [] })

const REQUEST_HOOKS: ReadonlySet<RequestHookName> = new Set([
  'onBeforeRequest',
  'onRequestIntercept',
  'onResponseIntercept',
  'onAfterRequest'
])

export class HookRegistry {
  private readonly request: Record<RequestHookName, Bucket<RequestContext>> = {
    onBeforeRequest: newBucket(),
    onRequestIntercept: newBucket(),
    onResponseIntercept: newBucket(),
    onAfterRequest: newBucket()
  }

  private readonly update: Bucket<unknown> = newBucket()
  private readonly init: Middleware<{ tg: unknown }>[] = []
  private readonly shutdown: Middleware<{ tg: unknown }>[] = []
  private readonly error: ErrorHandler[] = []
  private readonly dispatchError: DispatchErrorHandler[] = []

  add (name: RequestHookName, fn: Middleware<RequestContext>, opts?: HookOptions): void
  add (name: 'onUpdate', fn: Middleware<unknown>, opts?: HookOptions): void
  add (name: 'onInit' | 'onShutdown', fn: Middleware<{ tg: unknown }>): void
  add (name: 'onError', fn: ErrorHandler): void
  add (name: 'onDispatchError', fn: DispatchErrorHandler): void
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
  add (name: string, fn: any, opts?: HookOptions): void {
    const priority = opts?.priority ?? 'normal'

    if (REQUEST_HOOKS.has(name as RequestHookName)) {
      this.request[name as RequestHookName][priority].push(fn)

      return
    }

    if (name === 'onUpdate') {
      this.update[priority].push(fn)

      return
    }

    if (name === 'onInit') {
      this.init.push(fn)

      return
    }

    if (name === 'onShutdown') {
      this.shutdown.push(fn)

      return
    }

    if (name === 'onError') {
      this.error.push(fn)

      return
    }

    if (name === 'onDispatchError') {
      this.dispatchError.push(fn)

      return
    }

    throw new Error(`unknown hook: ${name}`)
  }
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */

  async run (name: RequestHookName, ctx: RequestContext): Promise<void>
  async run (name: 'onUpdate', ctx: unknown): Promise<void>
  async run (name: 'onInit' | 'onShutdown', ctx: { tg: unknown }): Promise<void>
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
  async run (name: string, ctx: any): Promise<void> {
    if (REQUEST_HOOKS.has(name as RequestHookName)) {
      const bucket = this.request[name as RequestHookName]

      await runChain([...bucket.high, ...bucket.normal, ...bucket.low], ctx)

      return
    }

    if (name === 'onUpdate') {
      await runChain([...this.update.high, ...this.update.normal, ...this.update.low], ctx)

      return
    }

    if (name === 'onInit') {
      await runChain(this.init, ctx)

      return
    }

    if (name === 'onShutdown') {
      await runChain(this.shutdown, ctx)

      return
    }

    throw new Error(`unknown hook: ${name}`)
  }
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */

  /** runs onUpdate chain with a fixed slot for `tg.on(...)` handlers between `normal` and `low` */
  async runUpdate (ctx: unknown, userHandlers: Middleware<unknown>) {
    await runChain(
      [...this.update.high, ...this.update.normal, userHandlers, ...this.update.low],
      ctx
    )
  }

  async runError (err: Error, ctx: ErrorContext) {
    let current = err

    for (const handler of this.error) {
      const replacement = await handler(current, ctx)

      if (replacement instanceof Error) {
        current = replacement
      }
    }

    return current
  }

  /** returns true if any onDispatchError handler ran — caller treats the error as observed */
  async runDispatchError (err: Error, ctx: DispatchErrorContext) {
    if (this.dispatchError.length === 0) {
      return false
    }

    for (const handler of this.dispatchError) {
      await handler(err, ctx)
    }

    return true
  }
}

async function runChain<C> (chain: Middleware<C>[], ctx: C) {
  let i = 0
  const next = async (): Promise<void> => {
    if (i >= chain.length) {
      return
    }

    const fn = chain[i++]

    if (fn) {
      await fn(ctx, next)
    }
  }

  await next()
}
