import { rich } from '@puregram/rich'
import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

const SPEC_URL = 'https://www.rfc-editor.org/rfc/rfc9110.txt'

// an expandable quote arrives collapsed and holds inline text only — no nested blocks
telegram.onMessage(async (message) => {
  if (!message.hasText() || message.text !== '/report') {
    return
  }

  await message.sendRich(rich([
    rich.h2('september report'),
    rich.document(SPEC_URL, { caption: 'the full spec', credit: 'rfc-editor' }),
    rich.table([
      ['endpoint', 'calls', 'p99'],
      ['/search', '1.2m', '84ms'],
      ['/upload', '31k', '210ms']
    ], { compact: true, align: ['left', 'right', 'right'] }),
    rich.expandableBlockquote(
      'everything stayed within budget; the p99 on /upload traces back to one 400mb archive',
      'analytics'
    )
  ]))
})

await telegram.startPolling()
