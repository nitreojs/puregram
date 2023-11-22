import type { MessageEntity } from 'puregram'

export interface FormatResponse {
  text: string
  entities: MessageEntity[]
}

export interface MarkupItem2 {
  text: string
  entities: MessageEntity[]
}

export interface MarkupItem {
  type: string
  text: string

  additional?: Record<string, any>
}
