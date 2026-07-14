import { RichParseError, rich } from '@puregram/rich'
import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

// three ways to turn a string into a rich message
telegram.onMessage(async (message) => {
  if (!message.hasText()) {
    return
  }

  const source = message.text

  // 1. rich.md(str) — parse the grammar into blocks; throws RichParseError on invalid input
  try {
    await message.sendRich(rich.md(source))
  } catch (error) {
    if (!(error instanceof RichParseError)) {
      throw error
    }

    // 2. .lenient — never throws; unsupported constructs degrade to literal text
    await message.sendRich(rich.md.lenient(source))
  }

  // 3. rich.raw.md(str) — send verbatim, telegram parses it server-side. right for content
  //    already known to be valid (e.g. llm output produced against the rich grammar)
  await message.sendRich(rich.raw.md(source))
})

await telegram.startPolling()
