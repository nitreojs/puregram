import type { MessageUpdate } from '@puregram/api'

export class MediaGroupUpdate {
  readonly kind = 'media_group' as const
  readonly id: string
  readonly messages: MessageUpdate[]
  readonly raw: { id: string, messages: MessageUpdate[] }

  constructor (id: string, messages: MessageUpdate[]) {
    this.id = id
    this.messages = messages
    this.raw = { id, messages }
  }
}

declare module '@puregram/api' {
  interface UpdateKindMap {
    media_group: MediaGroupUpdate
  }
}
