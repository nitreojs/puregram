import { Formatted, format, markup } from '@puregram/markup'
import { Telegram } from 'puregram'

// `Formatted.fromMessage(msg)` lifts the incoming `(text|caption, entities|caption_entities)` pair
// into a `Formatted` — quote with the original formatting intact, no entity-bookkeeping by hand
const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(markup())

telegram.onMessage((message) => {
  if (!message.hasText()) {
    return
  }

  const original = Formatted.fromMessage(message)

  return message.send(format`you said:\n${original}`)
})

await telegram.startPolling()
