import { Telegram, InlineKeyboardBuilder } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.on('message', (context) => {
  const keyboard = new InlineKeyboardBuilder()
    .textButton({
      text: 'Some button',
      payload: 'Some payload'
    })
    .row()
    .textButton({
      text: 'Two buttons',
      payload: { objectPayload: true }
    })
    .textButton({
      text: 'In one row',
      payload: 'Payload is required'
    })
    .row()
    .urlButton({
      text: 'Some URL button',
      url: 'https://example.com'
    })
    .row()
    .switchToCurrentChatButton({
      text: 'Switch to current chat button',
      query: 'Foo bar baz'
    })
    .switchToChatButton({
      text: 'Switch to chat button',
      query: 'Test tost'
    })

  return context.send('Sending you an inline-keyboard using `InlineKeyboardBuilder`!', {
    reply_markup: keyboard,
    parse_mode: 'Markdown'
  })
})

telegram.updates.startPolling().then(
  () => console.log(`Bot @${telegram.bot.username} started polling`)
).catch(console.error)
