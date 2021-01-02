import { Telegram, InlineKeyboard } from 'puregram';

const telegram = new Telegram({
  token: process.env.TOKEN
});

telegram.updates.on('message', (context) => {
  const keyboard = InlineKeyboard.keyboard([
    [
      InlineKeyboard.textButton({
        text: 'Some button',
        payload: 'Some payload'
      })
    ],

    [
      InlineKeyboard.textButton({
        text: 'Two buttons',
        payload: { objectPayload: true }
      }),

      InlineKeyboard.textButton({
        text: 'In one row',
        payload: 'Payload is required'
      })
    ]
  ]);

  return context.send('Sending you an inline-keyboard using `InlineKeyboard`!', {
    reply_markup: keyboard,
    parse_mode: 'Markdown'
  });
});

telegram.updates.startPolling().then(
  () => console.log(`Bot @${telegram.bot.username} started polling`)
).catch(console.error);
