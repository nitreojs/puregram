import { flow } from '@puregram/flow'
import { InlineKeyboard, Telegram } from 'puregram'

// `waitForCallbackQuery` / `waitForCommand` are sugar over `waitFor('callback_query'|'message', { filter })`
// both auto-scope to the source chat + sender by default — no manual predicate plumbing
const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(flow())

telegram.onMessage(async (message) => {
  if (!message.hasText() || message.text !== '/confirm') {
    return
  }

  await message.send('press a button:', {
    reply_markup: InlineKeyboard.keyboard([[
      InlineKeyboard.textButton({ text: 'approve', payload: 'approve' }),
      InlineKeyboard.textButton({ text: 'reject', payload: 'reject' })
    ]])
  })

  // predicate narrows by callback data; auto-scope already constrains to (chat, sender)
  const query = await message.flow.waitForCallbackQuery(
    q => q.data === 'approve' || q.data === 'reject',
    { timeout: 30_000, nullOnTimeout: true }
  )

  if (query === null) {
    return message.send('timed out')
  }

  await query.answer({ text: `you chose ${query.data ?? '?'}` })

  // string form of `waitForCommand` matches `/done`, `/done@bot`, `/done args...`
  const done = await message.flow.waitForCommand('done', { timeout: 60_000, nullOnTimeout: true })

  await message.send(done === null ? 'never received /done' : 'received /done — wrapping up')
})

await telegram.startPolling()
