import { markup, format, bold, italic, code } from '@puregram/markup'
import { Telegram } from 'puregram'

// `.extend(markup())` installs an `onBeforeRequest` hook that walks outgoing message params
// and converts every `Formatted` value into a real `entities` array — no `parse_mode` ever
const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(markup())

telegram.onMessage((message) => {
  // tagged-template form — composes naturally with embedded `Formatted` values
  return message.send(
    format`hey! this ${bold('message')} is ${italic('formatted')} without ${code('parse_mode')}`
  )
})

await telegram.startPolling()
