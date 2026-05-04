import { session } from '@puregram/session'
import { LruMemoryStorage } from '@puregram/storage'
import { Telegram } from 'puregram'

// `LruMemoryStorage` caps total entries — old keys evict on overflow
// useful for stateless-ish bots where you don't want unbounded memory growth
declare module '@puregram/session' {
  interface SessionData {
    counter: number
    last_seen: number
  }
}

const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(session({
    storage: new LruMemoryStorage({ max: 10_000 }),
    initial: () => ({ last_seen: Date.now(), counter: 0 })
  }))

telegram.onMessage(async (message) => {
  const previous = message.session.last_seen

  message.session.last_seen = Date.now()

  await message.send(`last seen ${Date.now() - previous}ms ago`)
})

await telegram.startPolling()
