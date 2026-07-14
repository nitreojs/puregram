import { rich } from '@puregram/rich'
import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

// `rich.md` parses a markdown template into native blocks (bot api 10.2). interpolated
// values splice safely — a user string never becomes markup, builder nodes render in place
telegram.onMessage(async (message) => {
  if (!message.hasText()) {
    return
  }

  await message.sendRich(rich.md`
    # ${message.text}

    sent as ${rich.bold('native blocks')} — the server parses nothing.

    ${rich.list(['safe interpolation', 'headings, lists, tables, media', 'one wire format'])}
  `)
})

await telegram.startPolling()
