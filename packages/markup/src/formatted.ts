import type { TelegramMessageEntity } from '@puregram/api'

// `type` is the literal-union from `TelegramMessageEntity['type']` so emitted
// `Formatted` values flow into bot-api method args without a cast. widening
// to `string` historically worked, but the schema now extracts the literal-union
// from the bot-api docs and bot-api method args expect the narrow type
export interface Entity {
  type: TelegramMessageEntity['type']
  offset: number
  length: number
  url?: string
  user?: { id: number, is_bot: boolean, first_name: string, last_name?: string, username?: string }
  language?: string
  custom_emoji_id?: string
  unix_time?: number
  date_time_format?: string
}

export class Formatted {
  constructor (
    readonly text: string,
    readonly entities: readonly Entity[] = []
  ) {}

  static from (source: Formatted | { text: string, entities?: readonly Entity[] }) {
    if (source instanceof Formatted) {
      return source
    }

    return new Formatted(source.text, source.entities ?? [])
  }

  toString () {
    return this.text
  }
}
