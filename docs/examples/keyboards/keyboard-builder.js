import { Telegram, KeyboardBuilder } from 'puregram';

const telegram = new Telegram({
  token: process.env.TOKEN
});

telegram.updates.on('message', (context) => {
  const keyboard = new KeyboardBuilder()
    .textButton('Some button')
    .row()
    .textButton('Two buttons')
    .textButton('In one row')
    .resize(); // keyboard will be much smaller

  return context.send('Sending you a keyboard, generated using `KeyboardBuilder`!', {
    reply_markup: keyboard,
    parse_mode: 'Markdown'
  });
});

telegram.updates.startPolling().then(
  () => console.log(`Bot @${telegram.bot.username} started polling`)
).catch(console.error);
