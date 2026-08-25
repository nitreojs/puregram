import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

// an ephemeral command is invisible to the group — only the sender and the bot see it.
// register it so telegram marks it ephemeral in the client
await telegram.api.setMyCommands({
  commands: [{ command: 'secret', description: 'ephemeral whisper demo', is_ephemeral: true }]
})

// works in a supergroup. `/secret` arrives as an ephemeral command
telegram.onMessage(async (message) => {
  if (!message.hasText() || !/^\/secret/.test(message.text)) {
    return
  }

  // isEphemeral() narrows the ephemeral fields. sends/replies from an ephemeral context
  // auto-fill ephemeral_message_parameters + reply_parameters.ephemeral_message_id (only the sender sees them)
  if (message.isEphemeral()) {
    await message.send('only you can see this — ephemeral by default')

    // opt out per call to post a normal public message from the same context
    await message.send('everyone sees this one', { ephemeral: false })
  }
})

await telegram.startPolling()
