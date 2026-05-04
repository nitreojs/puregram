import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage((message) => {
  // type guards narrow the wrapped update — `hasText` proves `message.text` is defined
  if (message.hasText()) {
    return message.send(`you said: ${message.text}`)
  }

  // every wrapped update keeps `.raw` as the unmodified bot api payload
  if (message.raw.photo !== undefined) {
    return message.send('nice photo')
  }
})

await telegram.startPolling()
