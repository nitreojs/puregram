import {
  Telegram,
  MessageContext
} from 'puregram';

import { HearManager } from '@puregram/hear';

const telegram: Telegram = new Telegram({
  token: process.env.TOKEN
});

const hearManager: HearManager<MessageContext> = new HearManager<MessageContext>();

// Telling puregram that we are handling hearManager
// on `message` update
telegram.updates.on('message', hearManager.middleware);

// Strict string, triggers only on exact same string
hearManager.hear(
  '/strict',

  (context: MessageContext) => (
    context.send('Triggered by a strict string')
  )
);

// Regular expression
hearManager.hear(
  /^\/regexp$/i,

  (context: MessageContext) => (
    context.send('Triggered by a regexp')
  )
);

// Function
hearManager.hear(
  (
    text: string | undefined,
    context: MessageContext
  ) => (
    text === '/function' || context.senderId === 123
  ),

  (context: MessageContext) => (
    context.send(
      'Triggered only if text is "/function" ' +
      'or senderId is 123'
    )
  )
);

/// Object notations:

// 1. Basic object
hearManager.hear(
  {
    text: '/test',
    isPM: true
  },

  (context: MessageContext) => (
    context.send(
      'Triggered only if text is equal to "/test" ' +
      'and it is private messages'
    )
  )
);

// 2. Regexp
hearManager.hear(
  {
    text: /test/i,
    senderId: 1337
  },

  (context: MessageContext) => (
    context.send(
      'Triggered if both text has "test" in it ' +
      'and senderId is 1337'
    )
  )
);

// 3. Array with callback or regexp in it
hearManager.hear(
  {
    senderId: [1, /^2/, (id: number) => id === 3]
  },

  (context: MessageContext) => (
    context.send(
      'Triggered only if senderId is 1, ' +
      'starts with 2, or equals to 3'
    )
  )
);

// 4. Nested properties
// * context.session = { action: 'test' }
hearManager.hear(
  {
    'session.action': 'test'
  },

  (context: MessageContext) => (
    context.send(
      'Triggered only if session.action is "test"'
    )
  )
);

telegram.updates.startPolling().catch(console.log);

