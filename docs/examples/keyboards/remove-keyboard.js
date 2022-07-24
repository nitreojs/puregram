// INFO: https://core.telegram.org/bots/api#replykeyboardremove

import { Telegram, RemoveKeyboard } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.on('message', (context) => (
  context.send('if there was a default keyboard under the input, it\'d be removed now!', {
    reply_markup: new RemoveKeyboard(),
    parse_mode: 'markdown'
  })
))

telegram.updates.startPolling()
  .then(() => console.log(`started polling @${telegram.bot.username}`))
  .catch(console.error)
