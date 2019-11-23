let { oneLine } = require('common-tags');
let { Telegram, HTML, Markdown } = require('puregram');

let telegram = new Telegram({
  token: process.env.TOKEN,
});

telegram.updates.hear(/^markdown$/i, (context) => {
  return context.send(
    oneLine`
      Some ${Markdown.bold('epic')} ${Markdown.italic('markdown')}
      ${Markdown.code('right')} ${Markdown.url('there', 'example.com')}!
    `,
    {
      /**
       * There are 3 ways to pass Markdown or HTML as a parameter.
       * 
       * First is to pass class into parse_mode.
       */
      parse_mode: Markdown,

      /**
       * Second is to pass <class>.parseMode to get class parse mode
       */
      parse_mode: Markdown.parseMode,

      /**
       * Third is to pass a string
       */
      parse_mode: 'Markdown',
    },
  );
});

telegram.updates.hear(/^html$/i, (context) => {
  return context.send(
    oneLine`
      Same ${HTML.bold('epic')} ${HTML.italic('markdown')}
      ${HTML.code('but now')} ${HTML.url('using HTML', 'example.com')}!
    `,
    { parse_mode: HTML },
  );
})

telegram.updates.startPolling();
