/* eslint-disable no-dupe-keys */
let { oneLine } = require('common-tags');
let { Telegram, HTML, Markdown, MarkdownV2 } = require('puregram');

let telegram = new Telegram({
  token: process.env.TOKEN
});

telegram.updates.hear(/^markdown$/i, (context) => context.send(
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
    }
  ));

telegram.updates.hear(/^html$/i, (context) => context.send(
    oneLine`
      Same ${HTML.bold('epic')} ${HTML.italic('markdown')}
      ${HTML.code('but now')} ${HTML.url('using HTML', 'example.com')}!
    `,
    { parse_mode: HTML }
  ));

telegram.updates.hear(/^markdown-v2$/i, (context) => context.send(
    oneLine`
      Some ${MarkdownV2.bold('epic')} ${MarkdownV2.italic('markdown')}
      ${MarkdownV2.code('right')} ${MarkdownV2.url('there', 'example.com')}!
      ${MarkdownV2.strikethrough('Also,')} ${MarkdownV2.underline('MarkdownV2 support')}!
    `,
    { parse_mode: MarkdownV2 }
  ));

telegram.updates.startPolling().then(
  () => console.log('Started polling')
).catch(console.error);
