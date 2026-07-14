import { rich } from '@puregram/rich'
import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

// build from data with builders — `rich([...])` emits native blocks directly, no template,
// no parsing. runs of inline content coalesce into paragraphs
telegram.onMessage(async (message) => {
  if (!message.hasText()) {
    return
  }

  await message.sendRich(rich([
    rich.h1('status report'),
    rich.paragraph(['overall: ', rich.bold('green')]),
    rich.table([
      ['metric', 'value'],
      ['uptime', '99.9%'],
      ['errors', 0]
    ], { bordered: true, align: ['left', 'right'] }),
    rich.blockquote('all systems nominal', 'ops')
  ]))
})

await telegram.startPolling()
