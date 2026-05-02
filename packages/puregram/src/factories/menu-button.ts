import type {
  TelegramMenuButtonCommands,
  TelegramMenuButtonDefault,
  TelegramMenuButtonWebApp
} from '@puregram/api'

/**
 * static factories for the `MenuButton` discriminated union — passed to
 * `setChatMenuButton` and read from `getChatMenuButton`
 *
 * @example
 * ```ts
 * tg.api.setChatMenuButton({ chat_id, menu_button: MenuButton.webApp('open', 'https://example.com') })
 * tg.api.setChatMenuButton({ chat_id, menu_button: MenuButton.default() })
 * ```
 */
export class MenuButton {
  /** clears any per-chat menu button override; falls back to bot-wide default */
  static default (): TelegramMenuButtonDefault {
    return { type: 'default' }
  }

  /** opens the bot's command list */
  static commands (): TelegramMenuButtonCommands {
    return { type: 'commands' }
  }

  /** launches a web app at the given url */
  static webApp (text: string, url: string): TelegramMenuButtonWebApp {
    return { type: 'web_app', text, web_app: { url } }
  }
}
