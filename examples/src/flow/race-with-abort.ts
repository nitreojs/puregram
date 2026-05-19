import { flow, spec } from '@puregram/flow'
import { Telegram } from 'puregram'

// `waitForAny` races multiple waiter specs — first to match wins, losers are cancelled
// share `AbortSignal.timeout(ms)` to set a single deadline across the whole race
const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(flow())

telegram.onMessage(async (message) => {
  if (!message.hasText() || message.text !== '/race') {
    return
  }

  await message.send('send "yes", "no", or wait 10s')

  // `spec(kind, opts)` preserves the literal kind so `value` is typed precisely per branch
  const result = await message.flow.waitForAny(
    [
      spec('message', { filter: (m) => m.text === 'yes' }),
      spec('message', { filter: (m) => m.text === 'no' })
    ],
    { signal: AbortSignal.timeout(10_000) }
  )

  // `index` tells you which spec matched; `value` is the matched update
  await message.send(`won by index ${result.index}: "${result.value.text ?? ''}"`)
})

await telegram.startPolling()
