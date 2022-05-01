import { Telegram, InlineKeyboard } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.on('message', (context) => {
  const keyboard = InlineKeyboard.keyboard([
    [
      InlineKeyboard.textButton({
        text: 'Some button',
        payload: 'Some payload'
      })
    ],

    [
      InlineKeyboard.textButton({
        text: 'Two buttons',
        payload: { objectPayload: true }
      }),

      InlineKeyboard.textButton({
        text: 'In one row',
        payload: 'Payload is required'
      })
    ],

    [
      InlineKeyboard.urlButton({
        text: 'Some URL button',
        url: 'https://example.com'
      })
    ],

    [
      InlineKeyboard.switchToCurrentChatButton({
        text: 'Switch to current chat button',
        query: 'Foo bar baz'
      }),

      InlineKeyboard.switchToChatButton({
        text: 'Switch to chat button',
        query: 'Test tost'
      })
    ]
  ])

  return context.send('Sending you an inline-keyboard using `InlineKeyboard`!', {
    reply_markup: keyboard,
    parse_mode: 'Markdown'
  })
})

telegram.updates.startPolling().then(
  () => console.log(`Bot @${telegram.bot.username} started polling`)
).catch(console.error)
