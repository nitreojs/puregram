/**
 * Bot that handles start value
 * https://core.telegram.org/bots#deep-linking
 */

let { stripIndents } = require('common-tags');
let { Telegram } = require('puregram');

/*
 * We will be using this as bot's data
 * (see 50 line)
 */
let data = null;

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

      Share this link to anyone you want to invite: t.me/${data.username}?start=${context.senderId}
    `

    return context.send(message, { parse_mode: 'HTML' });
  }
);

telegram.updates.startPolling().then(
  async () => {
    let botInfo = await telegram.api.getMe();

    data = botInfo;

    console.log('Started polling, fetched bot info:');
    console.log(`Info: ${botInfo.first_name} (@${botInfo.username})`);
  }
).catch(console.error);
