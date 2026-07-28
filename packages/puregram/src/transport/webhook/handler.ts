import { createDebug } from '../../debug'
import { WebhookTimeout } from '../../errors'

import type { ResolvedWebhookOptions } from './options'
import { ReplySlot, replyAls } from './reply'

const debug = createDebug('puregram:webhook')

export interface ParsedRequest {
  method: string
  headers: Record<string, string | undefined>
  body: Record<string, unknown> | undefined
}

export interface WebhookResponse {
  status: number
  body: string
  contentType: string
}

export interface WebhookHandlerDeps {
  /** dispatches a raw update through the configured chain */
  dispatch: (raw: Record<string, unknown>) => Promise<void>
  /** registers an in-flight promise so `shutdown()` can drain it */
  trackInFlight: (p: Promise<void>) => void
  /** ensures `tg.start()` has resolved before dispatch */
  ensureStarted: () => Promise<void>
  /** routes uncaught dispatch errors through the configured funnel */
  reportError: (err: Error, raw: Record<string, unknown>) => void
}

export type WebhookHandler = (req: ParsedRequest) => Promise<WebhookResponse>

const EMPTY: WebhookResponse = { status: 200, body: '', contentType: 'text/plain' }

type RaceOutcome = 'settled' | 'claimed' | 'timeout'

let warnedAboutTimeout = false

export function createHandler (
  options: ResolvedWebhookOptions,
  deps: WebhookHandlerDeps
) {
  const handler: WebhookHandler = async (req) => {
    if (req.method !== 'POST') {
      return { status: 405, body: '', contentType: 'text/plain' }
    }

    if (options.secretToken !== undefined) {
      const got = req.headers['x-telegram-bot-api-secret-token']

      if (got === undefined || !safeCompare(got, options.secretToken)) {
        return { status: 401, body: '', contentType: 'text/plain' }
      }
    }

    if (!req.body || typeof req.body !== 'object') {
      return { status: 400, body: '', contentType: 'text/plain' }
    }

    const raw = req.body

    await deps.ensureStarted()

    if (!options.webhookReply) {
      const promise = deps.dispatch(raw).catch((error: unknown) => {
        deps.reportError(error as Error, raw)
      })

      deps.trackInFlight(promise)

      return EMPTY
    }

    return runWithReplySlot(raw, options, deps)
  }

  return handler
}

async function runWithReplySlot (
  raw: Record<string, unknown>,
  options: ResolvedWebhookOptions,
  deps: WebhookHandlerDeps
) {
  const slot = new ReplySlot()
  // ALS propagation lets `runRequest` claim `slot` from inside any handler-driven api call
  const dispatchPromise = replyAls.run(slot, () => deps.dispatch(raw))
    .catch((error: unknown) => {
      deps.reportError(error as Error, raw)
    })

  deps.trackInFlight(dispatchPromise)

  const racers: Promise<RaceOutcome>[] = [
    dispatchPromise.then<RaceOutcome>(() => 'settled'),
    slot.claimed.then<RaceOutcome>(() => 'claimed')
  ]

  let timeoutHandle: ReturnType<typeof setTimeout> | undefined

  if (options.timeoutMilliseconds > 0) {
    racers.push(new Promise<RaceOutcome>((resolve) => {
      timeoutHandle = setTimeout(() => resolve('timeout'), options.timeoutMilliseconds)
    }))
  }

  let outcome: RaceOutcome

  try {
    outcome = await Promise.race(racers)
  } finally {
    if (timeoutHandle !== undefined) {
      clearTimeout(timeoutHandle)
    }
  }

  if (slot.payload) {
    return {
      status: 200,
      body: JSON.stringify({ method: slot.payload.method, ...slot.payload.params }),
      contentType: 'application/json'
    }
  }

  if (outcome === 'timeout') {
    return answerTimeout(raw, options, deps)
  }

  return EMPTY
}

function answerTimeout (
  raw: Record<string, unknown>,
  options: ResolvedWebhookOptions,
  deps: WebhookHandlerDeps
) {
  debug('dispatch outlived %dms', options.timeoutMilliseconds)

  if (typeof options.onTimeout === 'function') {
    options.onTimeout(raw)

    return EMPTY
  }

  if (options.onTimeout === 'throw') {
    deps.reportError(new WebhookTimeout(options.timeoutMilliseconds), raw)

    return { status: 500, body: '', contentType: 'text/plain' }
  }

  if (!warnedAboutTimeout) {
    warnedAboutTimeout = true

    process.emitWarning(
      `a webhook dispatch outlived timeoutMilliseconds (${options.timeoutMilliseconds}) and was answered with 200 while still running — telegram now treats the update as delivered and may send the next one for that chat concurrently. set onTimeout to change this`,
      { code: 'PUREGRAM_WEBHOOK_DISPATCH_TIMEOUT' }
    )
  }

  return EMPTY
}

// secret_token is A-Za-z0-9_-, so charCodeAt is exact; a pure-js compare keeps
// node:crypto off the import graph for the edge-targeting `web` adapter
function safeCompare (a: string, b: string) {
  if (a.length !== b.length) {
    return false
  }

  let diff = 0

  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return diff === 0
}
