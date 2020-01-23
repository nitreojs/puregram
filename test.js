let TOKEN = '563339696:AAFfyb6N3dFiUkyruQ3RuqSj0mjFE88ieJw'

let { Telegram, Keyboard } = require('./packages/puregram')

let telegram = new Telegram({
  token: TOKEN,
  apiUrl: 'http://proxy.quadi.fun/bot',
})

telegram.updates.on('message', async (context) => {
  console.log(context.text)

  if (context.text === null) return

  await context.send('test', {
    reply_markup: Keyboard.keyboard([
      Keyboard.pollRequestButton(context.text),
    ]).resize(),
  })
})

telegram.updates.on('poll_answer', async (context) => {
  console.log('poll_answer', context)
})

telegram.updates.on('poll', async (context) => {
  console.log('poll', context)
})

telegram.updates.startPolling()
