let { Telegram } = require('puregram');

let telegram = new Telegram({
  token: process.env.TOKEN,
  mergeEvents: true
});

/*
 * Now with `mergeEvents` enabled
 * puregram will automatically merge
 * all events with the same `mediaGroupId`
 * into one
 */

telegram.updates.on(
  'message',
  async (context) => {
    if (context.hasAttachments()) {
      context.send(`${context.attachments.length} attachments detected`);
    }

    /*
     * If you send 2 pictures to the bot
     * and `mergeEvents` is `true`,
     * then bot will respond this:
     * 
     * `2 attachments detected`
     * 
     * But if `mergeEvents` is `false`,
     * bot will respond this:
     * 
     * `1 attachments detected`
     * `1 attachments detected`
     */
  }
);

telegram.updates.startPolling().then(
  () => console.log('Started polling')
).catch(console.error);
