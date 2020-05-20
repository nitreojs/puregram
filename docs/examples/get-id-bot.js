/*
 * Simple inline bot which gets your ID in telegram
 * and sends it as a message
 */

let { Telegram, InlineKeyboard } = require('puregram');
let { stripIndents } = require('common-tags');

let telegram = new Telegram({
  token: process.env.TOKEN
});

/*
 * We will be using this as bot's data
 * (see line 60)
 */
let botData = {};

telegram.updates.hear(
  /^\/start$/i,
  (context) => context.send(
    stripIndents`
      This is an <b>inline</b> bot which allows you to <b>get your ID</b> in Telegram.
      Just type \`@${botData.username}\` and <b>click</b> on inline cell!
    `,
    { parse_mode: 'HTML' }
  )
)

telegram.updates.on(
  'inline_query',
  (context) => context.answerInlineQuery([
    {
      type: 'article',
      id: context.id,
      title: 'Get your ID',
      description: `Your ID is ${context.senderId}`,

      input_message_content: {
        message_text: `My ID is <b>${context.senderId}</b>! Which ID is yours?`,
        parse_mode: 'HTML'
      },

      reply_markup: InlineKeyboard.keyboard([
        [
          InlineKeyboard.switchToCurrentChatButton({
            text: 'Get my ID',
            query: ''
          })
        ]
      ])
    }
  ], {
    is_personal: true,
    cache_time: 1
  })
)

telegram.updates.startPolling().then(
  async () => {
    botData = await telegram.api.getMe();

    console.log('Started polling!');
  }
).catch(console.error);
