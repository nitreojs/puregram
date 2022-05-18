import { Telegram } from 'puregram'
import { getCasinoValues } from '@puregram/utils'

const telegram = new Telegram({
  token: process.env.TOKEN
})

telegram.updates.on('message', (context) => {
  if (context.hasDice && context.dice.emoji === '🎰') {
    // INFO: for example, user has got seven, bar, grapes
    console.log(getCasinoValues(context.dice.value)) // ['seven', 'bar', 'grapes']
  }
})

telegram.updates.startPolling().catch(console.error)
