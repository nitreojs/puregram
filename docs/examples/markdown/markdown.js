import { Telegram, Markdown } from 'puregram';

const telegram = new Telegram({
  token: process.env.TOKEN
});

telegram.updates.on('message', (context) => {
  const message = `A ${Markdown.bold('message')} with ${Markdown.italic('markdown')}!`;
  const anotherMessage = `One more *message* with _markdown_, but without a class!`;

  await Promise.all([
    context.send(message, { parse_mode: 'Markdown' }),       // <-- Note how we are telling telegram
    context.send(anotherMessage, { parse_mode: 'Markdown' }) // that there are some Markdown entities in the message
  ])
});

telegram.updates.startPolling().then(
  () => console.log(`Started polling @${telegram.bot.username}`)
).catch(console.error);
