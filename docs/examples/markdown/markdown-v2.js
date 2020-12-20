import { Telegram, MarkdownV2 } from 'puregram';

const telegram = new Telegram({
  token: process.env.TOKEN
});

// The difference between Markdown and MarkdownV2 classes
// is that MarkdownV2 can handle ~strikethrough~ and __underlined__ entities...
// and that's it!
// -> https://core.telegram.org/bots/api#markdownv2-style <-

telegram.updates.on('message', (context) => {
  const message = `A ${MarkdownV2.bold('message')} with some ${MarkdownV2.strikethrough('epic')} ${MarkdownV2.underline('markdown')}!`;
  const anotherMessage = `Same *message* with ~epic~ __markdown__.`;

  await Promise.all([
    context.send(message, { parse_mode: 'MarkdownV2' }),       // <-- Note how we are telling telegram
    context.send(anotherMessage, { parse_mode: 'MarkdownV2' }) // that there are some MarkdownV2 entities in the message
  ])
});

telegram.updates.startPolling().then(
  () => console.log(`Started polling @${telegram.bot.username}`)
).catch(console.error);
