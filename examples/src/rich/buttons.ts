import { rich } from '@puregram/rich'
import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

// a button takes exactly one action — two or none throws RichError
telegram.onMessage(async (message) => {
  if (!message.hasText() || message.text !== '/plans') {
    return
  }

  await message.sendRich(rich([
    rich.h2('pick a plan'),
    rich.paragraph(['the ', rich.button('terms', { url: 'https://telegram.org/tos' }), ' apply']),
    rich.buttonRow([
      rich.button('free', { callbackData: 'plan:free' }),
      rich.button('pro', { callbackData: 'plan:pro', style: 'primary' }),
      rich.button('enterprise', { disabled: true })
    ], { align: 'center' })
  ]))
})

telegram.onCallbackQuery(async (query) => {
  if (query.data === undefined || !query.data.startsWith('plan:')) {
    return
  }

  await query.answer({ text: `you picked ${query.data.slice('plan:'.length)}`, show_alert: true })
})

await telegram.startPolling()
