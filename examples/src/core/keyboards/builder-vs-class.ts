import { Telegram, InlineKeyboard, InlineKeyboardBuilder } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage(async (message) => {
  // `InlineKeyboard.keyboard([[...rows]])` is the array-shape — concise for static layouts
  const viaClass = InlineKeyboard.keyboard([
    [
      InlineKeyboard.textButton({ text: 'a', payload: 'a' }),
      InlineKeyboard.textButton({ text: 'b', payload: 'b' })
    ],
    [InlineKeyboard.textButton({ text: 'c', payload: 'c' })]
  ])

  // `InlineKeyboardBuilder` is the chain-shape — better when rows are built from a loop
  const viaBuilder = new InlineKeyboardBuilder()
    .textButton({ text: 'a', payload: 'a' })
    .textButton({ text: 'b', payload: 'b' })
    .row()
    .textButton({ text: 'c', payload: 'c' })

  await message.send('via class', { reply_markup: viaClass })
  await message.send('via builder', { reply_markup: viaBuilder })
})

await telegram.startPolling()
