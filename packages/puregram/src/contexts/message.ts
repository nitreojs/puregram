import { inspectable } from 'inspectable'

import {
  AnimationAttachment,
  Attachment,
  AudioAttachment,
  ContactAttachment,
  DocumentAttachment,
  LocationAttachment,
  PhotoAttachment,
  PollAttachment,
  StickerAttachment,
  StoryAttachment,
  VenueAttachment,
  VideoAttachment,
  VideoNoteAttachment,
  VoiceAttachment
} from '../common/attachments'

import { MediaGroup } from '../common/media-group'
import { Message, MessageEntity } from '../common/structures'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'

import { AttachmentType as AttachmentTypeEnum, EntityType } from '../types/enums'
import { AttachmentsMapping } from '../types/mappings'
import { AttachmentType, Constructor, Require, RequireValue, UpdateName } from '../types/types'
import { EVENTS, SERVICE_MESSAGE_EVENTS } from '../utils/constants'
import { applyMixins, filterPayload, isParseable } from '../utils/helpers'

import { Context } from './context'
import { ChatControlMixin, ChatInviteControlMixin, ChatMemberControlMixin, ChatSenderControlMixin, CloneMixin, NodeMixin, PinsMixin, SendMixin, TargetMixin } from './mixins'
import { MessageEntities } from '../common'

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

  #text: string | undefined
  #caption: string | undefined

  mediaGroup?: MediaGroup

  constructor (options: MessageContextOptions) {
    super({
      telegram: options.telegram,
      updateType: options.type ?? 'message',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload

    this.#text = this.payload.text
    this.#caption = this.payload.caption
  }

  /**
   * For text messages, the actual UTF-8 text of the message, 0-4096 characters
   */
  get text () {
    return this.#text
  }

  set text (text) {
    this.#text = text
  }

  /** Checks if the message has `text` property */
  hasText (): this is Require<this, 'text'> {
    return this.text !== undefined
  }

  /**
   * Caption for the animation, audio, document, photo, video or voice,
   * 0-1024 characters
   */
  get caption () {
    return this.#caption
  }

  set caption (caption) {
    this.#caption = caption
  }

  /** Checks if the message has `caption` property */
  hasCaption (): this is Require<this, 'caption'> {
    return this.caption !== undefined
  }

  /** Checks if the message has `dice` property */
  hasDice (): this is Require<this, 'dice'> {
    return this.dice !== undefined
  }

  /** Value after the `/start` command */
  get rawStartPayload () {
    if (!this.hasText()) {
      return
    }

    const text = this.text as string

    if (!text.startsWith('/start') || text === '/start') {
      return
    }

    return text.split(' ')[1]
  }

  /** Parsed value after the `/start` command */
  get startPayload () {
    let payload: any = this.rawStartPayload

    if (payload === undefined) {
      return
    }

    if (!Number.isNaN(+payload)) {
      payload = Number.parseInt(payload, 10)
    } else if (isParseable(payload)) {
      payload = JSON.parse(payload)
    }

    return payload
  }

  /** Does this message have start payload? */
  hasStartPayload (): this is Require<this, 'startPayload'> {
    return this.startPayload !== undefined
  }

  /** Checks if the message has `author_signature` property */
  hasAuthorSignature (): this is Require<this, 'authorSignature'> {
    return this.authorSignature !== undefined
  }

  /** Checks if there are any entities (with specified type) */
  hasEntities (type?: EntityType | MessageEntity['type']): this is Require<this, 'entities'> {
    if (this.entities === undefined) {
      return false
    }

    if (type === undefined) {
      return this.entities.length !== 0
    }

    return this.entities.some(entity => entity.type === type)
  }

  /** Checks if there are any caption entities (with specified type) */
  hasCaptionEntities (type?: EntityType | MessageEntity['type']): this is Require<this, 'captionEntities'> {
    if (this.captionEntities === undefined) {
      return false
    }

    if (type === undefined) {
      return this.captionEntities.length !== 0
    }

    return this.captionEntities.some(entity => entity.type === type)
  }

  /** Checks whether current message contains a media group (`mergeMediaEvents` must be on) */
  isMediaGroup (): this is Require<this, 'mediaGroupId' | 'mediaGroup'> {
    return this.mediaGroupId !== undefined
  }

  /** Message attachment */
  get attachment () {
    if (this.photo) {
      return new PhotoAttachment(this.photo)
    }

    if (this.contact) {
      return new ContactAttachment(this.payload.contact as Interfaces.TelegramContact)
    }

    if (this.poll) {
      return new PollAttachment(this.payload.poll as Interfaces.TelegramPoll)
    }

    if (this.venue) {
      return new VenueAttachment(this.payload.venue as Interfaces.TelegramVenue)
    }

    if (this.location) {
      return new LocationAttachment(this.payload.location as Interfaces.TelegramLocation)
    }

    return this.sticker ?? this.story ?? this.animation ?? this.audio ?? this.document ?? this.video ?? this.videoNote ?? this.voice
  }

  /** Does this message have an attachment with a specific type `type`? */
  hasAttachmentType<T extends AttachmentType> (type: T): this is RequireValue<this, 'attachment', AttachmentsMapping[T]> {
    return this.attachment?.attachmentType === type
  }

  /** Does this message even have an attachment? */
  hasAttachment (): this is Require<this, 'attachment'> {
    return this.attachment !== undefined
  }

  /** Is this message an event? */
  isEvent () {
    return EVENTS.some(event => this[event[0]] !== undefined)
  }

  /** Event type */
  get eventType () {
    if (!this.isEvent()) {
      return
    }

    const value = EVENTS.find(
      (event) => {
        const tValue = this[event[0]]

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

  /** Is this message a service one? */
  isServiceMessage () {
    return SERVICE_MESSAGE_EVENTS.some(event => this.payload[event] !== undefined)
  }

  /** Is this message a forwarded one? */
  isForwarded (): this is Require<this, 'forwardedMessage'> {
    return this.forwardedMessage !== undefined
  }

  /** Does this message have reply message? */
  hasReplyMessage (): this is Require<this, 'replyMessage'> {
    return this.replyMessage !== undefined
  }

  /** Checks if the sent message has `via_bot` property */
  hasViaBot (): this is Require<this, 'viaBot'> {
    return this.viaBot !== undefined
  }

  // INFO: deprecated methods

  /** @deprecated use `attachment` instead */
  get attachments () {
    return [this.attachment] as Attachment[]
  }

  /** @deprecated use `hasAttachmentType(type)` and `hasAttachment` instead */
  hasAttachments (type?: AttachmentType | AttachmentTypeEnum) {
    if (type === undefined) {
      return this.hasAttachment()
    }

    return this.hasAttachmentType(type)
  }

  /** @deprecated */
  getAttachments(type: AttachmentTypeEnum.Animation | 'animation'): AnimationAttachment[]
  getAttachments(type: AttachmentTypeEnum.Audio | 'audio'): AudioAttachment[]
  getAttachments(type: AttachmentTypeEnum.Contact | 'contact'): ContactAttachment[]
  getAttachments(type: AttachmentTypeEnum.Document | 'document'): DocumentAttachment[]
  getAttachments(type: AttachmentTypeEnum.Location | 'location'): LocationAttachment[]
  getAttachments(type: AttachmentTypeEnum.Photo | 'photo'): PhotoAttachment[]
  getAttachments(type: AttachmentTypeEnum.Poll | 'poll'): PollAttachment[]
  getAttachments(type: AttachmentTypeEnum.Sticker | 'sticker'): StickerAttachment[]
  getAttachments(type: AttachmentTypeEnum.Story | 'story'): StoryAttachment[]
  getAttachments(type: AttachmentTypeEnum.Venue | 'venue'): VenueAttachment[]
  getAttachments(type: AttachmentTypeEnum.Video | 'video'): VideoAttachment[]
  getAttachments(type: AttachmentTypeEnum.VideoNote | 'video_note'): VideoNoteAttachment[]
  getAttachments(type: AttachmentTypeEnum.Voice | 'voice'): VoiceAttachment[]
  getAttachments(type?: AttachmentType | AttachmentTypeEnum): Attachment[]
  getAttachments (type?: any): Attachment[] {
    const attachment = this.attachment as Attachment

    if (type === undefined) {
      return [attachment]
    }

    return this.attachment?.attachmentType === type ? [attachment] : []
  }

  /** @deprecated use `isForwarded` instead */
  get isForward () {
    return this.isForwarded
  }
}

interface MessageContext extends Constructor<MessageContext>, Message, TargetMixin, SendMixin, NodeMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin<MessageContext, MessageContextOptions> { }
applyMixins(MessageContext, [Message, TargetMixin, SendMixin, NodeMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin])

inspectable(MessageContext, {
  serialize: function (context) {
    const payload: Record<string, any> = {
      id: context.id,
      from: context.from,
      createdAt: context.createdAt,
      chat: context.chat,
      forwardMessage: context.forwardedMessage,
      replyMessage: context.replyMessage,
      viaBot: context.viaBot,
      updatedAt: context.updatedAt,
      authorSignature: context.authorSignature,
      text: context.text,
      entities: context.entities,
      captionEntities: context.captionEntities,
      dice: context.dice,
      caption: context.caption,
      contact: context.contact,
      location: context.location,
      venue: context.venue,
      poll: context.poll,
      replyMarkup: context.replyMarkup
    }

    if (context.mediaGroup !== undefined) {
      payload.mediaGroup = context.mediaGroup
    } else {
      payload.mediaGroupId = context.mediaGroupId
      payload.attachment = context.attachment
    }

    return filterPayload(payload)
  }
})

export { MessageContext }
