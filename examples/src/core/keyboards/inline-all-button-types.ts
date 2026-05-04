import { Telegram, InlineKeyboard, ButtonStyle } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage((message) => {
  // a kitchen-sink reference: every inline button kind on one keyboard
  // not all kinds are appropriate together in real bots — this is a directory, not a recipe
  const keyboard = InlineKeyboard.keyboard([
    [InlineKeyboard.textButton({ text: 'callback', payload: 'cb' })],
    [InlineKeyboard.urlButton({ text: 'open url', url: 'https://core.telegram.org' })],
    [InlineKeyboard.webAppButton({ text: 'web app', url: 'https://example.com/app' })],
    [InlineKeyboard.switchToCurrentChatButton({ text: 'inline (this chat)', query: 'foo' })],
    [InlineKeyboard.switchToChatButton({ text: 'inline (any chat)', query: 'bar' })],
    // `copyButton` copies the given text to the user's clipboard when tapped
    [InlineKeyboard.copyButton({ text: 'copy', copy: 'copied!' })],
    [
      // `style` accepts either a string literal or the named `ButtonStyle.*` constant — pick whichever reads better
      InlineKeyboard.textButton({ text: 'primary', payload: 'p', style: ButtonStyle.Primary }),
      InlineKeyboard.textButton({ text: 'danger', payload: 'd', style: ButtonStyle.Danger }),
      InlineKeyboard.textButton({ text: 'success', payload: 's', style: 'success' })
    ]
  ])

  return message.send('every button kind', { reply_markup: keyboard })
})

await telegram.startPolling()
