let { Telegram, InlineKeyboard } = require('puregram');

// Insert your ID here
let ADMIN_ID = 0;

// Insert your channel ID here
let CHANNEL_ID = 0;

let telegram = new Telegram({
  token: process.env.TOKEN
});

function isURL(source) {
  let rawUrlRegexp = '^(?!mailto:)(?:(?:https?|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
  let urlRegexp = new RegExp(rawUrlRegexp, 'i');

  return source.length < 2083 && urlRegexp.test(source);
}

telegram.updates.hear(
  /^\/post(?:\s+(?<data>.+)|$)/i,
  async (context) => {
    if (context.senderId !== ADMIN_ID) {
      return context.send('You have no access to this command.');
    }

    let syntax = 'Syntax: <code>/post https://example.com; Text of the post</code>';

    let { data } = context.$match.groups;

    if (!data) {
      return context.send(syntax, { parse_mode: 'HTML' });
    }

    let [link, text] = data.split(/\s*;\s*/);

    if (!link || !text || !isURL(link)) {
      return context.send(syntax, { parse_mode: 'HTML' });
    }

    /**
     * First entity is `bot_command`: `/post`
     *
     * Second is `url`: `https://example.com`
     */
    let entities = (context.entities || context.captionEntities).slice(2);

    // We use context.text because offsets are based on the whole context.text...
    let actualText = telegram.utils.tokenize({
      text: context.text || context.caption,
      entities,
      parseMode: 'HTML'
    });

    // ...and then slice the unused part
    actualText = actualText.slice(`/post ${link}; `.length, actualText.length);

    let keyboard = InlineKeyboard.keyboard([
      [
        InlineKeyboard.urlButton({
          text: '🔗 Link to the source',
          url: link
        })
      ]
    ]);

    let attachment = context.hasAttachments()
      ? context.attachments[0].big.fileId
      : null;

    if (attachment) {
      return telegram.api.sendPhoto({
        chat_id: CHANNEL_ID,
        photo: attachment,
        caption: actualText,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
    }

    return telegram.api.sendMessage({
      chat_id: CHANNEL_ID,
      text: actualText,
      reply_markup: keyboard,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
  }
)

telegram.updates.startPolling().then(
  () => console.log('Started polling!')
).catch(console.error);

