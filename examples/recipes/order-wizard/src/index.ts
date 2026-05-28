import { scenes } from '@puregram/scenes'
import { session } from '@puregram/session'
import { Telegram } from 'puregram'

import { order } from './scene'

const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  // session must come first — scenes declares `dependsOn: ['session']`
  .extend(session())
  .extend(scenes({ scenes: [order] }))

telegram.onMessage((message) => {
  if (message.text === '/order') {
    return message.scene.enter('order', { state: { giftWrap: false } })
  }
})

await telegram.startPolling()

console.log(`@${telegram.bot.username} is taking orders`)
