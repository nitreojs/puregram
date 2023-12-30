import { Inspect, Inspectable } from 'inspectable'
import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'
import { AnimationAttachment, AudioAttachment, ContactAttachment, DocumentAttachment, PhotoAttachment, StickerAttachment, StoryAttachment, VideoAttachment, VideoNoteAttachment, VoiceAttachment } from '../attachments'

import { MessageOriginChannel, MessageOriginChat, MessageOriginHiddenUser, MessageOriginUser } from './message-origin'
import { Chat } from './chat'
import { LinkPreviewOptions } from './link-preview-options'
import { PhotoSize } from './photo-size'
import { Dice } from './dice'
import { Poll } from './poll'
import { Game } from './game'
import { Invoice } from './invoice'
import { Location } from './location'
import { Venue } from './venue'
import { Giveaway } from './giveaway'
import { GiveawayWinners } from './giveaway-winners'

/** This object contains information about a message that is being replied to, which may come from another chat or forum topic. */
@Inspectable()
export class ExternalReplyInfo implements Structure {
  constructor (public payload: Interfaces.TelegramExternalReplyInfo) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Origin of the message replied to by the given message */
  @Inspect()
  get origin () {
    if (this.payload.origin.type === 'user') {
      return new MessageOriginUser(this.payload.origin)
    }

    if (this.payload.origin.type === 'chat') {
      return new MessageOriginChat(this.payload.origin)
    }

    if (this.payload.origin.type === 'channel') {
      return new MessageOriginChannel(this.payload.origin)
    }

    if (this.payload.origin.type === 'hidden_user') {
      return new MessageOriginHiddenUser(this.payload.origin)
    }

    throw new TypeError('unknown message origin type')
  }

  /** Chat the original message belongs to. Available only if the chat is a supergroup or a channel. */
  @Inspect({ nullable: false })
  get chat () {
    const { chat } = this.payload

    if (!chat) {
      return undefined
    }

    return new Chat(chat)
  }

  /** Unique message identifier inside the original chat. Available only if the original chat is a supergroup or a channel. */
  @Inspect({ nullable: false })
  get messageId () {
    return this.payload.message_id
  }

  /** Options used for link preview generation for the original message, if it is a text message */
  @Inspect({ nullable: false })
  get linkPreviewOptions () {
    const { link_preview_options } = this.payload

    if (!link_preview_options) {
      return undefined
    }

    return new LinkPreviewOptions(link_preview_options)
  }

  /** Message is an animation, information about the animation */
  @Inspect({ nullable: false })
  get animation () {
    const { animation } = this.payload

    if (!animation) {
      return undefined
    }

    return new AnimationAttachment(animation)
  }

  /** Message is an audio file, information about the file */
  @Inspect({ nullable: false })
  get audio () {
    const { audio } = this.payload

    if (!audio) {
      return undefined
    }

    return new AudioAttachment(audio)
  }

  /** Message is a general file, information about the file */
  @Inspect({ nullable: false })
  get document () {
    const { document } = this.payload

    if (!document) {
      return undefined
    }

    return new DocumentAttachment(document)
  }

  /** Message is a photo, available sizes of the photo */
  @Inspect({ nullable: false })
  get photo () {
    const { photo } = this.payload

    if (!photo) {
      return undefined
    }

    return new PhotoAttachment(photo.map(size => new PhotoSize(size)))
  }

  /** Message is a sticker, information about the sticker */
  @Inspect({ nullable: false })
  get sticker () {
    const { sticker } = this.payload

    if (!sticker) {
      return undefined
    }

    return new StickerAttachment(sticker)
  }

  /** Message is a forwarded story */
  @Inspect({ nullable: false })
  get story () {
    const { story } = this.payload

    if (!story) {
      return undefined
    }

    return new StoryAttachment(story)
  }

  /** Message is a video, information about the video */
  @Inspect({ nullable: false })
  get video () {
    const { video } = this.payload

    if (!video) {
      return undefined
    }

    return new VideoAttachment(video)
  }

  /** Message is a video note, information about the video message */
  @Inspect({ nullable: false })
  get videoNote () {
    const { video_note } = this.payload

    if (!video_note) {
      return undefined
    }

    return new VideoNoteAttachment(video_note)
  }

  /** Message is a voice message, information about the file */
  @Inspect({ nullable: false })
  get voice () {
    const { voice } = this.payload

    if (!voice) {
      return undefined
    }

    return new VoiceAttachment(voice)
  }

  /** `true`, if the message media is covered by a spoiler animation */
  @Inspect({ compute: true, nullable: false })
  hasMediaSpoiler () {
    return this.payload.has_media_spoiler
  }

  /** Message is a shared contact, information about the contact */
  @Inspect({ nullable: false })
  get contact () {
    const { contact } = this.payload

    if (!contact) {
      return undefined
    }

    return new ContactAttachment(contact)
  }

  /** Message is a dice with random value */
  @Inspect({ nullable: false })
  get dice () {
    const { dice } = this.payload

    if (!dice) {
      return undefined
    }

    return new Dice(dice)
  }

  /** Message is a game, information about the game */
  @Inspect({ nullable: false })
  get game () {
    const { game } = this.payload

    if (!game) {
      return undefined
    }

    return new Game(game)
  }

  /** Message is a scheduled giveaway, information about the giveaway */
  @Inspect({ nullable: false })
  get giveaway () {
    const { giveaway } = this.payload

    if (!giveaway) {
      return undefined
    }

    return new Giveaway(giveaway)
  }

  /** A giveaway with public winners was completed */
  @Inspect({ nullable: false })
  get giveawayWinners () {
    const { giveaway_winners } = this.payload

    if (!giveaway_winners) {
      return undefined
    }

    return new GiveawayWinners(giveaway_winners)
  }

  /** Message is an invoice for a payment, information about the invoice */
  @Inspect({ nullable: false })
  get invoice () {
    const { invoice } = this.payload

    if (!invoice) {
      return undefined
    }

    return new Invoice(invoice)
  }

  /** Message is a shared location, information about the location */
  @Inspect({ nullable: false })
  get location () {
    const { location } = this.payload

    if (!location) {
      return undefined
    }

    return new Location(location)
  }

  /** Message is a native poll, information about the poll */
  @Inspect({ nullable: false })
  get poll () {
    const { poll } = this.payload

    if (!poll) {
      return undefined
    }

    return new Poll(poll)
  }

  /** Message is a venue, information about the venue */
  @Inspect({ nullable: false })
  get venue () {
    const { venue } = this.payload

    if (!venue) {
      return undefined
    }

    return new Venue(venue)
  }

  toJSON (): Record<string, any> {
    return this.payload
  }
}
