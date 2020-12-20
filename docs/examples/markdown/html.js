import { Telegram, HTML } from 'puregram';

const telegram = new Telegram({
  token: process.env.TOKEN
});

telegram.updates.on('message', (context) => {
  const message = `A ${HTML.bold('message')} with ${HTML.italic('HTML markdown')}!`;
  const anotherMessage = `Another <b>message</b> with <i>HTML markdown</i>.`;

  await Promise.all([
    context.send(message, { parse_mode: 'HTML' }),       // <-- Note how we are telling telegram
    context.send(anotherMessage, { parse_mode: 'HTML' }) // that there are some HTML entities in the message
  ])
});

telegram.updates.startPolling().then(
  () => console.log(`Started polling @${telegram.bot.username}`)
).catch(console.error);
