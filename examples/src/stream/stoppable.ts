import { setTimeout as sleep } from 'node:timers/promises'

import { stream } from '@puregram/stream'
import { Telegram } from 'puregram'

const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(stream())

async function * slowTokens (): AsyncIterable<string> {
  for (let index = 1; index <= 60; index++) {
    await sleep(400)

    yield `token ${index} `
  }
}

// `canStop` puts a stop button on every draft; without `keepOnStop` the partial is dropped
// instead of being persisted as a real message
telegram.onMessage(async (message) => {
  if (!message.hasText() || message.text !== '/long') {
    return
  }

  const result = await message.stream(slowTokens(), { canStop: true, keepOnStop: true })

  const summary = result.stopped
    ? `stopped after ${result.pieces} pieces, kept ${result.messages.length} message(s)`
    : `finished with ${result.messages.length} message(s)`

  console.log(summary)
})

// the plugin stops the matching run itself — handlers still receive the update
telegram.onStoppedMessageGeneration((update) => {
  console.log(`draft ${update.draftId} stopped in chat ${update.chat.id}`)
})

await telegram.startPolling()
