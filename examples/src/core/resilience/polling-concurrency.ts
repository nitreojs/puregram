import { Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage(async (message) => {
  // simulate slow work — without sequentializeBy, two messages in the same chat could interleave
  await new Promise(resolve => setTimeout(resolve, 500))

  await message.send(`done with: ${message.text ?? '(non-text)'}`)
})

// concurrency 8 caps parallel dispatches; sequentializeBy keeps per-chat updates strictly in order
await telegram.startPolling({
  concurrency: 8,
  sequentializeBy: (raw) =>
    String(raw.message?.chat.id ?? raw.callback_query?.message?.chat.id ?? '')
})
