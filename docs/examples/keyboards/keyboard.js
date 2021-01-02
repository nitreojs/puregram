import { Telegram, Keyboard } from 'puregram';

const telegram = new Telegram({
  token: process.env.TOKEN
});

telegram.updates.on('message', (context) => {
  const keyboard = Keyboard.keyboard([
    [
      Keyboard.textButton('Some button')
    ],

    [
      Keyboard.textButton('Two buttons'),
      Keyboard.textButton('In one row')
    ]
  ]).resize(); // keyboard will be much smaller

  return context.send('Sending you a keyboard, generated using `Keyboard`!', {
    reply_markup: keyboard,
    parse_mode: 'Markdown'
  });
});

telegram.updates.startPolling().then(
  () => console.log(`Bot @${telegram.bot.username} started polling`)
).catch(console.error);
