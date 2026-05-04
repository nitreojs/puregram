import { flow } from '@puregram/flow'
import { Telegram } from 'puregram'

// `.extend(flow())` attaches `update.flow` with `prompt`, `waitFor`, `collectMediaGroup`
// these *suspend the handler* until a matching update arrives
const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(flow())

telegram.onMessage(async (message) => {
  if (!message.hasText() || !/^\/signup$/i.test(message.text)) {
    return
  }

  // `prompt(text, opts)` sends the question, waits for the next message from the same user
  // `nullOnTimeout: true` returns null instead of throwing — handle it as a soft cancel
  const name = await message.flow.prompt("what's your name?", {
    timeout: 60_000,
    nullOnTimeout: true
  })

  if (name === null) {
    return message.send('took too long — cancelled')
  }

  // `name` is `MessageUpdate` — `.text` is the raw string from the incoming message
  await message.send(`nice to meet you, ${name.text ?? '?'}`)
})

await telegram.startPolling()
