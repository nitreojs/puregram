import { session } from '@puregram/session'
import { Telegram } from 'puregram'

// declaration-merge to type your session shape once
// `message.session` becomes `SessionData & ...` everywhere — no casts at the call site
declare module '@puregram/session' {
  interface SessionData {
    counter: number
    last_seen: number
  }
}

const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(session({ initial: () => ({ counter: 0, last_seen: Date.now() }) }))

telegram.onMessage(async (message) => {
  // assignments persist back to storage when the handler chain returns
  message.session.counter += 1

  await message.send(`you've sent ${message.session.counter} message(s) so far`)
})

await telegram.startPolling()
