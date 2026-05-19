import { session } from '@puregram/session'
import { Telegram } from 'puregram'

// `getStorageKey` returning a `StorageKeyDescriptor` builds a composite key —
// segments emit in fixed order `user:<id>:chat:<id>:thread:<id>:key:<value>`
// useful for per-(chat, topic) state in forum supergroups without manual key concatenation
declare module '@puregram/session' {
  interface SessionData {
    counter: number
    last_seen: number
  }
}

const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(session({
    initial: () => ({ counter: 0, last_seen: Date.now() }),
    getStorageKey: (update) => {
      if (!update.is('message')) {
        return undefined
      }

      return {
        chat: update.chatId,
        thread: update.raw.message_thread_id,
        user: update.senderId
      }
    }
  }))

telegram.onMessage(async (message) => {
  message.session.counter += 1
  message.session.last_seen = Date.now()

  await message.send(`per (user, chat, thread) tuple counter: ${message.session.counter}`)
})

await telegram.startPolling()
