import { throttler } from '@puregram/throttler'
import { Telegram } from 'puregram'

// outbound rate-limit — keeps bot api calls under telegram's documented thresholds
// pair with `retryOnFloodWait` for belt-and-braces: throttler smoothes traffic, retry covers spikes
const telegram = Telegram
  .fromToken(process.env.TOKEN!, { retryOnFloodWait: true })
  .extend(throttler({
    // ~30 req/s globally is telegram's bot-api ceiling
    globalPerSec: 30,
    // ~1 message/s per private chat
    perChatPerSec: 1,
    // ~20 messages/min per group/supergroup
    perGroupPerMin: 20,

    // per-method overrides — methods listed here get isolated buckets with the
    // supplied limits. unspecified fields fall back to the top-level defaults
    perMethod: {
      // upload-heavy methods get tighter pacing per chat
      sendVideo: { perChatPerSec: 0.2 },          // 1 video every 5 seconds per chat
      sendMediaGroup: { perChatPerSec: 0.5 },     // 1 album every 2 seconds per chat
      // typing indicator pulses fast without spamming real messages
      sendChatAction: { perChatPerSec: 10 },
      // forwards are cheap server-side — looser than the message default
      forwardMessage: { perChatPerSec: 5 }
    },

    // bound per-bucket queue depth; `drop` throws synchronously past the cap instead of queuing
    maxQueueDepth: 500,
    mode: 'queue'
  }))

telegram.onMessage(async (message) => {
  // tight loop — throttler paces sends to obey per-chat windows automatically
  for (let i = 0; i < 5; i += 1) {
    await message.send(`burst ${i + 1}/5`)
  }
})

await telegram.startPolling()
