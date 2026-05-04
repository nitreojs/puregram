import { Telegram } from 'puregram'

const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .defineUpdate('cron-tick')

// `defineUpdate` registers a userland-emitted update kind
// `emit` dispatches it through the same handler chain real updates use
// `onUpdate` with an `is(kind)` guard narrows the type to `CustomUpdate`
telegram.onUpdate((update) => {
  if (update.kind === 'cron-tick') {
    console.log('cron tick:', update.raw)
  }
})

setInterval(() => {
  telegram.emit('cron-tick', { ranAt: Date.now() })
}, 60_000)

await telegram.startPolling()
