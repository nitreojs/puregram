import type { Telegram } from 'puregram'

interface InternalTelegram {
  handleIncoming: (raw: Record<string, unknown>) => Promise<void>
}

export async function inject (tg: Telegram, raw: Record<string, unknown>) {
  await (tg as unknown as InternalTelegram).handleIncoming(raw)
}
