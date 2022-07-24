// https://core.telegram.org/bots/api#forcereply

import { Telegram, ForceReply } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.on('message', (context) => (
  context.send('sending you a force-reply keyboard!', { reply_markup: new ForceReply() })
))

telegram.updates.startPolling()
  .then(() => console.log(`started polling @${telegram.bot.username}`))
  .catch(console.error)
