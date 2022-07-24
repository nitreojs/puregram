import { Telegram, InlineKeyboardBuilder } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.on('message', (context) => {
  const keyboard = new InlineKeyboardBuilder()
    .textButton({
      text: 'some button',
      payload: 'some payload'
    })
    .row()
    .textButton({
      text: 'two buttons',
      payload: { objectPayload: true }
    })
    .textButton({
      text: 'in one row',
      payload: 'payload is required'
    })
    .row()
    .urlButton({
      text: 'some url button',
      url: 'https://example.com'
    })
    .row()
    .switchToCurrentChatButton({
      text: 'switch to current chat button',
      query: 'foo bar baz'
    })
    .switchToChatButton({
      text: 'switch to chat button',
      query: 'test tost'
    })

  return context.send('sending you an inline-keyboard using `InlineKeyboardBuilder`!', {
    reply_markup: keyboard,
    parse_mode: 'markdown'
  })
})

telegram.updates.startPolling()
  .then(() => console.log(`started polling @${telegram.bot.username}`))
  .catch(console.error)
