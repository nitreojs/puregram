import { Telegram } from 'puregram'
import { HearManager } from '@puregram/hear'

const telegram = Telegram.fromToken(process.env.TOKEN)

const hearManager = new HearManager()

// INFO: telling puregram that we are handling hearManager on `message` update
telegram.updates.on('message', hearManager.middleware)

// INFO: strict string, triggers only on exact same string
hearManager.hear(
  '/strict',
  (context) => context.send('triggered by a strict string')
)

// INFO: regular expression
hearManager.hear(
  /^\/regexp$/i,
  (context) => context.send('triggered by a regexp')
)

// INFO: function
hearManager.hear(
  (text, context) => text === '/function' || context.senderId === 123,
  (context) => context.send('triggered only if text is "/function" or senderId is 123')
)

// INFO: object notations
// INFO: 1. basic object
hearManager.hear(
  {
    text: '/test',
    isPM: () => true
  },

  (context) => context.send('triggered only if text is equal to "/test" and it is private messages')
)

// INFO: 2. regexp
hearManager.hear(
  {
    text: /test/i,
    senderId: 1337
  },

  (context) => context.send('triggered if both text has "test" in it and senderId is 1337')
)

// INFO: 3. an array with callback or regexp in it
hearManager.hear(
  { senderId: [1, /^2/, (id) => id === 3] },
  (context) => context.send('triggered only if senderId is 1, starts with 2, or equals to 3')
)

// INFO: 4. nested properties
// NOTE: context.session = { action: 'test' }
hearManager.hear(
  { 'session.action': 'test' },
  (context) => context.send('triggered only if session.action is "test"')
)

// INFO: triggered when no other hears are triggered
hearManager.onFallback((context) => context.send('command not found.'))

telegram.updates.startPolling()
  .then(() => console.log(`started polling @${telegram.bot.username}`))
  .catch(console.error)
