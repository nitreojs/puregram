import { Telegram } from 'puregram'
import { getCasinoValues } from '@puregram/utils'

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.on('message', (context) => {
  if (context.hasDice && context.dice.emoji === '🎰') {
    // INFO: for example, user has got seven, bar, grapes
    console.log(getCasinoValues(context.dice.value)) // ['seven', 'bar', 'grapes']
  }
})

telegram.updates.startPolling()
  .then(() => console.log(`started polling @${telegram.bot.username}`))
  .catch(console.error)
