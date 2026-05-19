/** telegram bot api soft limit — about 30 requests per second globally per bot */
export const DEFAULT_GLOBAL_PER_SEC = 30

/** telegram bot api soft limit — at most 1 message per second to the same private chat */
export const DEFAULT_PER_CHAT_PER_SEC = 1

/** telegram bot api soft limit — at most 20 messages per minute to the same group/supergroup */
export const DEFAULT_PER_GROUP_PER_MIN = 20

/** sliding window length for the global bucket */
export const GLOBAL_WINDOW_MS = 1_000

/** sliding window length for per-chat (private) buckets */
export const PER_CHAT_WINDOW_MS = 1_000

/** sliding window length for per-group buckets */
export const PER_GROUP_WINDOW_MS = 60_000

/**
 * methods exempt from throttling by default. these are control-plane calls that
 * either don't count toward send budgets or shouldn't ever be queued behind them
 */
export const DEFAULT_EXCLUDED_METHODS: readonly string[] = [
  'getMe',
  'getUpdates',
  'getWebhookInfo',
  'logOut',
  'close'
]
