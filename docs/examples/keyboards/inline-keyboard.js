import { Telegram, InlineKeyboard } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.on('message', (context) => {
  const keyboard = InlineKeyboard.keyboard([
    [
      InlineKeyboard.textButton({
        text: 'some button',
        payload: 'some payload'
      })
    ],

    [
      InlineKeyboard.textButton({
        text: 'two buttons',
        payload: { objectPayload: true }
      }),

      InlineKeyboard.textButton({
        text: 'in one row',
        payload: 'payload is required'
      })
    ],

    [
      InlineKeyboard.urlButton({
        text: 'some url button',
        url: 'https://example.com'
      })
    ],

    [
      InlineKeyboard.switchToCurrentChatButton({
        text: 'switch to current chat button',
        query: 'foo bar baz'
      }),

      InlineKeyboard.switchToChatButton({
        text: 'switch to chat button',
        query: 'test tost'
      })
    ],

    [
      InlineKeyboard.textButton({
        text: 'primary button',
        payload: 'primary',
        style: 'primary'
      }),

      InlineKeyboard.textButton({
        text: 'danger button',
        payload: 'danger',
        style: 'danger'
      }),

      InlineKeyboard.textButton({
        text: 'success button',
        payload: 'success',
        style: 'success'
      })
    ],

    [
      InlineKeyboard.textButton({
        text: 'button with icon',
        payload: 'icon',
        iconCustomEmojiId: '5456557315920518340'
      }),

      InlineKeyboard.textButton({
        text: 'styled button with icon',
        payload: 'styled-icon',
        iconCustomEmojiId: '5456557315920518340',
        style: 'primary'
      })
    ]
  ])

  return context.send('sending you an inline-keyboard using `InlineKeyboard`!', {
    reply_markup: keyboard,
    parse_mode: 'markdown'
  })
})

telegram.updates.startPolling()
  .then(() => console.log(`started polling @${telegram.bot.username}`))
  .catch(console.error)
