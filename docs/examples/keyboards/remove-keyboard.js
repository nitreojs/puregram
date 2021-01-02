// https://core.telegram.org/bots/api#replykeyboardremove

import { Telegram, RemoveKeyboard } from 'puregram';

const telegram = new Telegram({
  token: process.env.TOKEN
});

telegram.updates.on('message', (context) => {
  return context.send('If there was a default keyboard under the input, I will remove it now!', {
    reply_markup: new RemoveKeyboard,
    parse_mode: 'Markdown'
  });
});

telegram.updates.startPolling().then(
  () => console.log(`Bot @${telegram.bot.username} started polling`)
).catch(console.error);
