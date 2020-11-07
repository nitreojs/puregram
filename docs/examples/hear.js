import { Telegram } from 'puregram';
import { HearManager } from '@puregram/hear';

const telegram = new Telegram({
  token: process.env.TOKEN
});

const hearManager = new HearManager();

// Telling puregram that we are handling hearManager
// on `message` update
telegram.updates.on('message', hearManager.middleware);

// Strict string, triggers only on exact same string
hearManager.hear(
  '/strict',
  (context) => context.send('Triggered by a strict string')
);

// Regular expression
hearManager.hear(
  /^\/regexp$/i,
  (context) => context.send('Triggered by a regexp')
);

// Function
hearManager.hear(
  (text, context) => text === '/function' || context.senderId === 123,
  (context) => context.send(
    'Triggered only if text is "/function" ' +
    'or senderId is 123'
  )
);

/// Object notations:

// 1. Basic object
hearManager.hear(
  {
    text: '/test',
    isPM: true
  },

  (context) => context.send(
    'Triggered only if text is equal to "/test" ' +
    'and it is private messages'
  )
);

// 2. Regexp
hearManager.hear(
  {
    text: /test/i,
    senderId: 1337
  },

  (context) => context.send(
    'Triggered if both text has "test" in it ' +
    'and senderId is 1337'
  )
);

// 3. Array with callback or regexp in it
hearManager.hear(
  {
    senderId: [1, /^2/, (id) => id === 3]
  },

  (context) => context.send(
    'Triggered only if senderId is 1, ' +
    'starts with 2, or equals to 3'
  )
);

// 4. Nested properties
// * context.session = { action: 'test' }
hearManager.hear(
  {
    'session.action': 'test'
  },

  (context) => context.send(
    'Triggered only if session.action is "test"'
  )
);

// Triggered when no other hears triggered
hearManager.onFallback(
  (context) => context.send('Command not found.')
);

telegram.updates.startPolling().then(
  () => console.log(`Started polling @${telegram.bot.username}`)
).catch(console.error);

