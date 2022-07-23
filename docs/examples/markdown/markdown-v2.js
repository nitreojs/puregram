import { Telegram, MarkdownV2 } from 'puregram'

const telegram = new Telegram({
  token: process.env.TOKEN
})

// INFO: the difference between `Markdown` and `MarkdownV2` classes
// INFO: is that `MarkdownV2` can handle ~strikethrough~ and __underlined__ entities...
// INFO: and that's it!
// -> https://core.telegram.org/bots/api#markdownv2-style <-

telegram.updates.on('message', (context) => {
  const message = `a ${MarkdownV2.bold('message')} with some ${MarkdownV2.strikethrough('epic')} ${MarkdownV2.underline('markdown')}\\!`
  const anotherMessage = 'same *message* with ~epic~ __markdown__\\.'

  await Promise.all([
    context.send(message, { parse_mode: 'markdownv2' }), // <-- note how we are telling telegram
    context.send(anotherMessage, { parse_mode: 'markdownv2' }) //     that there are some markdownv2 entities in the message
  ])
})

telegram.updates.startPolling().then(
  () => console.log(`started polling @${telegram.bot.username}`)
).catch(console.error)
