import { TelegramMessageEntityType } from 'puregram/generated'

interface MarkupItemPayload {
  type: TelegramMessageEntityType
  text: string

  // eslint-disable-next-line no-use-before-define
  items?: MarkupItem[]
  additional?: Record<string, unknown>
  index?: number
}

export class MarkupItem {
  constructor (private payload: MarkupItemPayload) { }

  get type () {
    return this.payload.type
  }

  get text (): string {
    // return this.items?.text ?? this.payload.text
    return this.payload.text
  }

  get additional () {
    return this.payload.additional
  }

  get items () {
    return this.payload.items
  }

  get index () {
    return this.payload.index ?? 0
  }

  set index (value) {
    this.payload.index = value
  }
}
