/**
 * Bot that handles start value
 * https://core.telegram.org/bots#deep-linking
 */

let { stripIndents } = require('common-tags');
let { Telegram } = require('puregram');

let telegram = new Telegram({
  token: process.env.TOKEN
});

telegram.updates.hear(
  /^\/start/i,
  async (context) => {
    if (context.startPayload) {
      return Promise.all([
        telegram.api.sendMessage({
          chat_id: context.startPayload,
          text: `You invited <b><a href="tg://user?id=${context.senderId}">${context.from.firstName}</a></b> to this bot! Thanks!`,
          parse_mode: 'HTML'
        }),

        context.send(`Hooray! <b><a href="tg://user?id=${context.startPayload}">This user</a></b> invited you to this bot!`, {
          parse_mode: 'HTML'
        })
      ]);
    }

    let message = stripIndents`
      <b>Hello!</b>

      <i>Nobody invited you to this bot! :(</i>
      But you can invite everyone you want!

      Share this link to anyone you want to invite: t.me/${telegram.bot.username}?start=${context.senderId}
    `

    return context.send(message, { parse_mode: 'HTML' });
  }
);

telegram.updates.startPolling().then(
  () => {
    console.log('Started polling, fetched bot info:');
    console.log(`Info: ${telegram.bot.firstName} (@${telegram.bot.username})`);
  }
).catch(console.error);
