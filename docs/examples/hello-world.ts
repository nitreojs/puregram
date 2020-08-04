import { Telegram, MessageContext } from '../../packages/puregram';

const telegram: Telegram = new Telegram({
  token: process.env.TOKEN
});

telegram.updates.on('message', (context: MessageContext) => {
  if (context.text && /hello/i.test(context.text)) {
    return context.send('Hello, World!');
  }
});

telegram.updates.startPolling().then(
  () => console.log(`Started polling @${telegram.bot.username}`)
).catch(
  (e: Error) => console.log(e)
);
