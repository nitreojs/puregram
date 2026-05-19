import { Telegram } from 'puregram'

// `swallowDispatchErrors: true` suppresses the default rethrow-on-microtask fallback
// register `tg.catch(...)` to log/report or your handler errors silently disappear
const telegram = Telegram.fromToken(process.env.TOKEN!, {
  swallowDispatchErrors: true
})

telegram.catch((err, ctx) => {
  // `ctx.raw` is the raw bot api update payload that triggered the failing handler
  console.error(`handler failed on update ${ctx.raw.update_id as number}:`, err)
})

telegram.onMessage((message) => {
  if (message.hasText() && message.text === '/boom') {
    throw new Error('intentional crash — handled via tg.catch')
  }

  return message.send('try /boom to see the error funnelled through tg.catch')
})

await telegram.startPolling()
