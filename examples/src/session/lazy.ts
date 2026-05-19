import { session } from '@puregram/session'
import { Telegram } from 'puregram'

// `lazy: true` defers `storage.get` until you actually access `update.session`
// the proxy resolves via `await` — no read for handlers that never touch session
declare module '@puregram/session' {
  interface SessionData {
    counter: number
    last_seen: number
  }
}

const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(session({ lazy: true, initial: () => ({ counter: 0, last_seen: Date.now() }) }))

telegram.onMessage(async (message) => {
  // pings without session reads stay free — only `/count` pays the storage round-trip
  if (!message.hasText() || message.text !== '/count') {
    return message.send('lazy session — no storage hit for this update')
  }

  const sess = await message.session

  sess.counter += 1
  sess.last_seen = Date.now()

  await message.send(`counter: ${sess.counter}`)
})

await telegram.startPolling()
