import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

// requires bot api 7.0+ — the bot must be admin (with reaction permission) in the chat to receive these
telegram.onMessageReaction((update) => {
  // `update.added` / `update.removed` give you the diff between `oldReaction` and `newReaction` directly
  // raw arrays are still available as `update.newReaction` / `update.oldReaction`
  console.log(`user ${update.user?.id ?? update.actorChat?.id} added:`, update.added)
  console.log('removed:', update.removed)
})

await telegram.startPolling({ allowedUpdates: ['message_reaction'] })
