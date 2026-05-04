import { rateLimit } from '@puregram/rate-limit'
import type { RateLimitEntry } from '@puregram/rate-limit'
import { session } from '@puregram/session'
import { MemoryStorage } from '@puregram/storage'
import { Telegram } from 'puregram'

declare module '@puregram/session' {
  interface SessionData {
    counter: number
    last_seen: number
  }
}

// two storages with the same backing type — both are `MemoryStorage` but typed for their consumer
// in production you'd swap both for the same redis adapter; this shows the `KVStorage` interface
// is the only contract that session and rate-limit care about
const sessionStorage = new MemoryStorage()
const rateLimitStorage = new MemoryStorage<RateLimitEntry>()

const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(session({ storage: sessionStorage, initial: () => ({ counter: 0, last_seen: Date.now() }) }))
  .extend(rateLimit({ storage: rateLimitStorage }))

telegram.onMessage(async (message) => {
  await message.send('hello — session + rate-limit each have their own typed storage')
})

await telegram.startPolling()
