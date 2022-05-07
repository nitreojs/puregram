import { inspectable } from 'inspectable'

import { Telegram } from '../telegram'
import { Message } from '../updates/'

import * as Interfaces from '../generated/telegram-interfaces'
import * as Attachments from '../common/attachments'
import { MessageEntity } from '../common/structures'

import { applyMixins, filterPayload, isParseable } from '../utils/helpers'
import { AttachmentType as AttachmentTypeEnum, EntityType } from '../types/enums'
import { AttachmentType, MessageEventName, UpdateName } from '../types/types'
import { EVENTS } from '../utils/constants'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin } from './mixins'

interface MessageContextOptions {
  telegram: Telegram
  update?: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId?: number
  type?: UpdateName
}

/** Called when `message` event occurs */
class MessageContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor(options: MessageContextOptions) {
    super({
      telegram: options.telegram,
      updateType: options.type ?? 'message',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Checks if the message has `dice` property */
  get hasDice() {
    return this.dice !== undefined
  }

  get startPayload() {
    if (!this.hasText) {
      return
    }

    if (!this.text!.startsWith('/start') || this.text === '/start') {
      return
    }

    let payload: any = this.text!.split(' ')[1]

    if (!Number.isNaN(+payload)) {
      payload = Number.parseInt(payload, 10)
    } else if (isParseable(payload)) {
      payload = JSON.parse(payload)
    }

    return payload
  }

  /** Checks if the message has `text` property */
  get hasText() {
    return this.text !== undefined
  }

  /** Checks if the message has `author_signature` property */
  get hasAuthorSignature() {
    return this.authorSignature !== undefined
  }

  /** Checks if there are any entities (with specified type) */
  hasEntities(type?: EntityType | MessageEntity['type']) {
    if (type === undefined) {
      return this.entities.length !== 0
    }

    return this.entities.some(entity => entity.type === type)
  }

  /** Checks if the message has `caption` property */
  get hasCaption() {
    return this.caption !== undefined
  }

  /** Checks if there are any caption entities (with specified type) */
  hasCaptionEntities(type?: EntityType | MessageEntity['type']) {
    if (type === undefined) {
      return this.captionEntities.length !== 0
    }

    return this.captionEntities.some(entity => entity.type === type)
  }

  /** Message attachments */
  get attachments() {
    const attachments: Attachments.Attachment[] = []

    if (this.audio) attachments.push(this.audio)
    if (this.document) attachments.push(this.document)
    if (this.animation) attachments.push(this.animation)
    if (this.photo) attachments.push(new Attachments.PhotoAttachment(this.photo))
    if (this.sticker) attachments.push(this.sticker)
    if (this.video) attachments.push(this.video)
    if (this.voice) attachments.push(this.voice)
    if (this.videoNote) attachments.push(this.videoNote)
    if (this.venue) attachments.push(this.venue)

    return attachments
  }

  /** Checks if there are attachments */
  hasAttachments(type?: AttachmentType | AttachmentTypeEnum) {
    if (type === undefined) {
      return this.attachments.length > 0
    }

    return this.attachments.some(attachment => attachment.attachmentType === type)
  }

  /** Gets attachments */
  getAttachments(type: AttachmentTypeEnum.Animation | 'animation'): Attachments.AnimationAttachment[]
  getAttachments(type: AttachmentTypeEnum.Audio | 'audio'): Attachments.AudioAttachment[]
  getAttachments(type: AttachmentTypeEnum.Document | 'document'): Attachments.DocumentAttachment[]
  getAttachments(type: AttachmentTypeEnum.Photo | 'photo'): Attachments.PhotoAttachment[]
  getAttachments(type: AttachmentTypeEnum.Sticker | 'sticker'): Attachments.StickerAttachment[]
  getAttachments(type: AttachmentTypeEnum.Video | 'video'): Attachments.VideoAttachment[]
  getAttachments(type: AttachmentTypeEnum.VideoNote | 'video_note'): Attachments.VideoNoteAttachment[]
  getAttachments(type: AttachmentTypeEnum.Voice | 'voice'): Attachments.VoiceAttachment[]
  getAttachments(type?: AttachmentType | AttachmentTypeEnum): Attachments.Attachment[]
  getAttachments(type?: any): Attachments.Attachment[] {
    if (type === undefined) {
      return this.attachments
    }

    return this.attachments.filter(attachment => attachment.attachmentType === type)
  }

  /** Is this message an event? */
  get isEvent() {
    return EVENTS.some(event => Boolean(this[event[0] as keyof Message]))
  }

  /** Event type */
  get eventType() {
    if (!this.isEvent) {
      return
    }

    const value = EVENTS.find(
      (event) => {
        const tValue = this[event[0] as keyof Message]

        if (Array.isArray(tValue)) {
          return tValue.length !== 0
        }

        return tValue !== undefined
      }
    )

    if (value === undefined) {
      return
    }

    return value[1]
  }

  /** Is this message a forwarded one? */
  get isForward() {
    return this.forwardMessage !== undefined
  }

  /** Does this message have reply message? */
  get hasReplyMessage() {
    return this.replyMessage !== undefined
  }

  /** Checks if the sent message has `via_bot` property */
  get hasViaBot() {
    return this.viaBot !== undefined
  }

  /** Does this message have start payload? */
  get hasStartPayload() {
    return this.startPayload !== undefined
  }
}

interface MessageContext extends Message, TargetMixin, SendMixin, NodeMixin { }
applyMixins(MessageContext, [Message, TargetMixin, SendMixin, NodeMixin])

inspectable(MessageContext, {
  serialize(message: MessageContext) {
    const payload = {
      id: message.id,
      from: message.from,
      createdAt: message.createdAt,
      chat: message.chat,
      forwardMessage: message.forwardMessage,
      replyMessage: message.replyMessage,
      viaBot: message.viaBot,
      updatedAt: message.updatedAt,
      mediaGroupId: message.mediaGroupId,
      authorSignature: message.authorSignature,
      text: message.text,
      entities: message.entities,
      captionEntities: message.captionEntities,
      dice: message.dice,
      attachments: message.attachments,
      caption: message.caption,
      contact: message.contact,
      location: message.location,
      venue: message.venue,
      poll: message.poll,
      replyMarkup: message.replyMarkup
    }

    return filterPayload(payload)
  }
})

export { MessageContext }
