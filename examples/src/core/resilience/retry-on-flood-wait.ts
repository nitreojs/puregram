import { Telegram } from 'puregram'

// opt-in to sleep-and-retry on 429 responses
// pass `true` for one retry with no wait cap, or an object to bound retries / max wait
const telegram = Telegram.fromToken(process.env.TOKEN!, {
  retryOnFloodWait: { max: 2, maxWaitMs: 30_000 }
})

telegram.onMessage((message) => {
  // if telegram answers 429 with `retry_after: 5`, this call sleeps 5s and retries automatically
  // beyond the configured ceiling (`max` retries or `maxWaitMs`) the error still propagates
  return message.send('hi — this call survives one flood_wait without manual handling')
})

await telegram.startPolling()
