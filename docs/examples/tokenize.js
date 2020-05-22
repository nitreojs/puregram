// This is an example how to work with `telegram.utils.tokenize` method

let { Telegram } = require('../../packages/puregram');

let telegram = new Telegram({
  token: process.env.TOKEN
});

telegram.updates.on(
  'message',
  async (context, next) => {

    /**
     * For example, user has sent this message: test **tost** _tust_
     *
     * With just `context.text` you will get this: test tost tust
     *
     * But what if you need to get test **tost** _tust_?
     *
     * There comes `telegram.utils.tokenize`.
     */
    if (context.hasEntities) {
      let tokenized = telegram.utils.tokenize({
        text: context.text,
        entities: context.entities || context.captionEntities,
        parseMode: 'HTML'
      });

      let message = `Raw message: \n${context.text}\n\nTokenized message: \n${tokenized}`;

      return context.send(message, { parse_mode: 'HTML' });
    }

    return next();
  }
);

telegram.updates.startPolling().then(
  () => console.log('Started polling')
).catch(console.error);
