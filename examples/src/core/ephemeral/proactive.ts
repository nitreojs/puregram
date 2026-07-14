import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

// an ADMIN bot can whisper to any non-bot member at any time — no trigger, no 15s window.
// tg.ephemeral(userId) is a scoped api proxy that injects receiver_user_id into every call
// (a call-site value still wins). requires the bot to be a chat administrator
telegram.onMessage(async (message) => {
  if (!message.hasText() || !/^\/nudge/.test(message.text)) {
    return
  }

  await telegram.ephemeral(message.senderId).sendMessage({
    chat_id: message.chatId,
    text: 'a private nudge — visible only to you'
  })
})

await telegram.startPolling()
