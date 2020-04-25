// Simple dice bot

let { Telegram } = require('puregram');

let telegram = new Telegram({
  token: process.env.TOKEN
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let ratings = [
  '<b>Perfect!</b>\nYou just got <b>1</b>! <b>You won!</b>',
  '<b>Good!</b>\nSeems like you just got <b>2</b>. Close enough!',
  '<b>Next time you\'ll do better!</b>\nTry again.',
  '<b>Yikes!</b>\nAh, I thought it was <b>1</b>. Nevermind.',
  '<b>Try again!</b>\nThe best score is <b>1</b>. You need to get it!',
  '<b>That\'s bruh.</b>'
]

telegram.updates.on(
  'message',
  async (context, next) => {
    // If the message was sent in chat
    // then ignore the message,
    // we want to answer only in Private Messages
    if (!context.isPM) return next();

    // Ignore if this is not an animated dice message
    // or if it is but it's not `dice`
    if (!context.dice || !context.dice.isDice) {
      return next();
    }

    // Now we know that this message is
    // an animated dice and it's `dice` and not like `darts`

    let { value } = context.dice;
    let rating = ratings[value - 1];

    await sleep(3000);
    await context.reply(rating, { parse_mode: 'HTML' });
  }
);

telegram.updates.hear(
  '/start',
  async (context) => {
    await context.send('<b>Hi!</b>\n\nSend me <b>dice emoji</b>, like this:', {
      parse_mode: 'HTML'
    });

    return context.sendDice();
  }
);

telegram.updates.startPolling();
