export interface Entity {
  type: string
  offset: number
  length: number
  url?: string
  user?: { id: number, is_bot: boolean, first_name: string, last_name?: string, username?: string }
  language?: string
  custom_emoji_id?: string
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
