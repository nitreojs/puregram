// https://core.telegram.org/bots/api#forcereply

import { Telegram, ForceReply } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.on('message', (context) => (
  context.send('Sending you a force-reply keyboard!', { reply_markup: new ForceReply() })
))

telegram.updates.startPolling().then(
  () => console.log(`Bot @${telegram.bot.username} started polling`)
).catch(console.error)
