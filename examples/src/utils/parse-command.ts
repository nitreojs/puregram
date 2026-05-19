import { parseCommand } from '@puregram/utils'
import { Telegram } from 'puregram'

// structured command parsing — splits `/cmd@bot args...` into name + bot + args + rest
// returns null when input isn't a well-formed command (no `/`, bad bot suffix, etc)
const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage((message) => {
  if (!message.hasText()) {
    return
  }

  const parsed = parseCommand(message.text)

  if (parsed === null) {
    return
  }

  if (parsed.command === 'buy') {
    return message.send(`buying ${parsed.args.join(', ') || '(nothing)'}`)
  }
})

await telegram.startPolling()
