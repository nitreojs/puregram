import type { TelegramUser } from '@puregram/api'

import type { DefaultParams } from './api/default-params'
import type { HttpClient } from './http/client'

/** opt-in 429 auto-retry config — `true` => one retry, no wait cap. object form overrides both knobs */
export interface RetryOnFloodWaitOptions {
  /** maximum number of retries on a single api call (default 1) */
  max?: number
  /** if `retry_after × 1000` exceeds this, propagate the error instead of sleeping (default Infinity) */
  maxWaitMs?: number
}

export interface TelegramOptions {
  token: string
  httpClient?: HttpClient
  /** pre-populate `tg.bot` and skip the start-time getMe call */
  bot?: TelegramUser
  allowedUpdates?: string[]
  apiBaseUrl?: string
  apiTimeout?: number
  apiWait?: number
  apiRetryLimit?: number
  apiHeaders?: Record<string, string>
  useTestDc?: boolean
  useLocal?: boolean
  /**
   * per-call params merged into every outgoing api call. `'*'` applies to any method
   * that accepts the param; a per-method key overrides `'*'`; an explicit call-site
   * value wins over both. set once here — there is no runtime setter
   */
  defaultParams?: DefaultParams
  /**
   * when the bot api answers with 429 + `parameters.retry_after`, sleep that many
   * seconds and retry the same call. defaults to `false` — opt-in to preserve
   * existing error propagation. pass an object to bound retries or wait time
   */
  retryOnFloodWait?: boolean | RetryOnFloodWaitOptions
  /**
   * when a dispatched update handler throws, the default behavior is to rethrow
   * on a microtask so node's `uncaughtException` kicks in. set to `true` to
   * suppress that fallback — errors only reach handlers registered via `tg.catch`
   */
  swallowDispatchErrors?: boolean
}

export interface ResolvedTelegramOptions extends Required<Omit<TelegramOptions, 'httpClient' | 'bot' | 'retryOnFloodWait' | 'swallowDispatchErrors'>> {
  httpClient: HttpClient | undefined
  bot?: TelegramUser
  retryOnFloodWait: boolean | RetryOnFloodWaitOptions
  swallowDispatchErrors: boolean
}

// sourced from package.json so the user-agent never drifts from the published
// version. read lazily — keeps node:fs off the import graph so core stays loadable
// on edge runtimes, where it degrades to an unversioned user-agent
let version = ''

try {
  const { readFileSync } = await import('node:fs')

  version = (JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8')
  ) as { version: string }).version
} catch {
  // no filesystem (edge runtime) — leave the version out of the user-agent
}

const USER_AGENT = version
  ? `puregram/${version} (+https://github.com/puregram/puregram)`
  : 'puregram (+https://github.com/puregram/puregram)'

export const DEFAULT_OPTIONS: Omit<ResolvedTelegramOptions, 'token' | 'httpClient'> = {
  allowedUpdates: [],
  apiBaseUrl: 'https://api.telegram.org/bot',
  apiTimeout: 30_000,
  apiWait: 3000,
  apiRetryLimit: -1,
  apiHeaders: {
    connection: 'keep-alive',
    'user-agent': USER_AGENT
  },
  useTestDc: false,
  useLocal: false,
  defaultParams: {},
  retryOnFloodWait: false,
  swallowDispatchErrors: false
}

export function resolveOptions (input: TelegramOptions) {
  return {
    ...DEFAULT_OPTIONS,
    ...input,
    apiHeaders: { ...DEFAULT_OPTIONS.apiHeaders, ...(input.apiHeaders ?? {}) },
    httpClient: input.httpClient,
    bot: input.bot
  } as ResolvedTelegramOptions
}
