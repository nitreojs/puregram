import { MemoryStorage, session } from '@puregram/session'
import { Telegram } from 'puregram'

import { DEFAULT_SETTINGS, type Settings, sessionKey } from './settings'

export type Bot = ReturnType<typeof createBot>['telegram']

declare module '@puregram/session' {
  interface SessionData {
    settings: Settings
  }
}

interface BotConfig {
  token: string
  publicUrl: string
}

export function createBot ({ token, publicUrl }: BotConfig) {
  const storage = new MemoryStorage<unknown>()

  const telegram = Telegram.fromToken(token).extend(
    session({
      storage,
      // single key per user — same shape the http endpoint uses
      getStorageKey: (update) => {
        const fromId = (update as { from?: { id?: number } }).from?.id

        return fromId === undefined ? undefined : sessionKey(fromId)
      },
      initial: () => ({ settings: { ...DEFAULT_SETTINGS } })
    })
  )

  telegram.onMessage(async (message) => {
    if (message.text !== '/start') {
      return
    }

    const userId = message.from?.id

    if (userId === undefined) {
      return
    }

    // pin a persistent "settings" launch button in the chat composer.
    // setChatMenuButton is per-chat — for groups it requires bot admin
    await telegram.api.setChatMenuButton({
      chat_id: userId,
      menu_button: {
        type: 'web_app',
        text: 'settings',
        web_app: { url: `${publicUrl}/` }
      }
    })

    const current = message.session.settings

    await message.send(
      'tap the settings button below the input field to edit your prefs\n\n'
      + 'current values:\n'
      + `  theme: ${current.theme}\n`
      + `  notifications: ${current.notifications}\n`
      + `  display name: ${current.displayName === '' ? '(not set)' : current.displayName}`
    )
  })

  return { telegram, storage }
}
