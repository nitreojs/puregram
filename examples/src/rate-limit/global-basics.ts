import { rateLimit, rateLimitFilter } from '@puregram/rate-limit'
import { Telegram, and, filters } from 'puregram'

const { command } = filters

const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(rateLimit({
    onLimitExceeded: async (update, retryAfter) => {
      // narrow with `is(...)` to reach the per-kind shortcuts (`.send`, `.answer`)
      if (update.is('message')) {
        await update.send(`slow down — try again in ${retryAfter}s`)
      } else if (update.is('callback_query')) {
        await update.answer({ text: `slow down — try again in ${retryAfter}s`, show_alert: true })
      }
    }
  }))

// gate `/buy` to 5 hits per 60s per user
// `rateLimitFilter` composes via `and(...)` — put it last so cheaper filters short-circuit first
telegram.onMessage(
  and(command('buy'), rateLimitFilter(telegram, { limit: 5, window: 60, bucket: 'buy' })),
  message => message.send('purchase confirmed')
)

await telegram.startPolling()
