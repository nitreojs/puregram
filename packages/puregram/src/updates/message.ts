import { inspectable } from 'inspectable'

import { TelegramMessage } from '../generated/telegram-interfaces'

import { User } from '../common/structures/user'
import { Chat } from '../common/structures/chat'
import { ForwardedMessage } from '../common/structures/forwarded-message'
import { MessageEntity } from '../common/structures/message-entity'
import { PhotoSize } from '../common/structures/photo-size'
import { Contact } from '../common/structures/contact'
import { Game } from '../common/structures/game'
import { Poll } from '../common/structures/poll'
import { Venue } from '../common/structures/venue'
import { Location } from '../common/structures/location'
import { Invoice } from '../common/structures/invoice'
import { Dice } from '../common/structures/dice'
import { SuccessfulPayment } from '../common/structures/successful-payment'
import { PassportData } from '../common/structures/passport-data'
import { InlineKeyboardMarkup } from '../common/structures/inline-keyboard-markup'
import { MessageAutoDeleteTimerChanged } from '../common/structures/message-auto-delete-timer-changed'
import { VideoChatEnded } from '../common/structures/video-chat-ended'
import { VideoChatParticipantsInvited } from '../common/structures/video-chat-participants-invited'
import { VideoChatStarted } from '../common/structures/video-chat-started'
import { VideoChatScheduled } from '../common/structures/video-chat-scheduled'
import { ProximityAlertTriggered } from '../common/structures/proximity-alert-triggered'
import { WebAppData } from '../common/structures/web-app-data'

import {
  AnimationAttachment,
  AudioAttachment,
  DocumentAttachment,
  VideoAttachment,
  VideoNoteAttachment,
  StickerAttachment,
  VoiceAttachment
} from '../common/attachments'

import { filterPayload } from '../utils/helpers'

/** This object represents a message. */
export class Message {
  constructor (public payload: TelegramMessage) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Unique message identifier inside this chat */
  get id () {
    return this.payload.message_id
  }

  /** Sender, empty for messages sent to channels */
  get from () {
    const { from } = this.payload

    if (!from) {
      return
    }

    return new User(from)
  }

  /**
   * Sender of the message, sent on behalf of a chat.
   * The channel itself for channel messages.
   * The supergroup itself for messages from anonymous group administrators.
   * The linked channel for messages automatically forwarded to the discussion group
   */
  get senderChat () {
    const { sender_chat } = this.payload

    if (!sender_chat) {
      return
    }

    return new Chat(sender_chat)
  }

  /** Date the message was sent in Unix time */
  get createdAt () {
    return this.payload.date
  }

  /** Conversation the message belongs to */
  get chat () {
    const { chat } = this.payload

    if (!chat) {
      return
    }

    return new Chat(chat)
  }

  /** @deprecated use `forwardedMessage` instead */
  get forwardMessage () {
    return this.forwardedMessage
  }

  /** Forwarded message if there is any */
  get forwardedMessage () {
    const { forward_date } = this.payload

    if (!forward_date) {
      return
    }

    return new ForwardedMessage(this.payload)
  }

  /** `true`, if the message is a channel post that was automatically forwarded to the connected discussion group */
  get isAutomaticForward () {
    return this.payload.is_automatic_forward
  }

  /** For replies, the original message */
  get replyMessage (): Omit<Message, 'replyMessage'> | undefined {
    const { reply_to_message } = this.payload

    if (!reply_to_message) {
      return
    }

    return new Message(reply_to_message)
  }

  /** Bot through which the message was sent */
  get viaBot () {
    const { via_bot } = this.payload

    if (!via_bot) {
      return
    }

    return new User(via_bot)
  }

  /** Date the message was last edited in Unix time */
  get updatedAt () {
    return this.payload.edit_date
  }

  /** `true`, if the message can't be forwarded */
  get hasProtectedContent () {
    return this.payload.has_protected_content as true | undefined
  }

  /** The unique identifier of a media message group this message belongs to */
  get mediaGroupId () {
    return this.payload.media_group_id
  }

  /**
   * Signature of the post author for messages in channels,
   * or the custom title of an anonymous group administrator
   */
  get authorSignature () {
    return this.payload.author_signature
  }

  /**
   * For text messages, the actual UTF-8 text of the message, 0-4096 characters
   */
  get text () {
    return this.payload.text
  }

  /**
   * For text messages, special entities like usernames, URLs, bot commands,
   * etc. that appear in the text
   */
  get entities () {
    const { entities } = this.payload

    if (!entities) {
      return []
    }

    return entities.map(entity => new MessageEntity(entity))
  }

  /**
   * Attachments
   *
   * I would like to create a function like
   * `getMessageAttachment<Audio>('audio')`
   * which automatically takes `audio` from `this.payload`
   * and if it exists creates `new Audio(audio)`
   *
   * :(
   */

  /**
   * Message is an animation, information about the animation. For backward
   * compatibility, when this field is set, the `document` field will also be set
   */
  get animation () {
    const { animation } = this.payload

    if (!animation) {
      return
    }

    return new AnimationAttachment(animation)
  }

  /** Message is an audio file, information about the file */
  get audio () {
    const { audio } = this.payload

    if (!audio) {
      return
    }

    return new AudioAttachment(audio)
  }

  /** Message is a general file, information about the file */
  get document () {
    const { document } = this.payload

    if (!document) {
      return
    }

    return new DocumentAttachment(document)
  }

  /** Message is a photo, available sizes of the photo */
  get photo () {
    const { photo } = this.payload

    if (!photo) {
      return
    }

    return photo.map(size => new PhotoSize(size))
  }

  /** Message is a sticker, information about the sticker */
  get sticker () {
    const { sticker } = this.payload

    if (!sticker) {
      return
    }

    return new StickerAttachment(sticker)
  }

  /** Message is a video, information about the video */
  get video () {
    const { video } = this.payload

    if (!video) {
      return
    }

    return new VideoAttachment(video)
  }

  /** Message is a video note, information about the video message */
  get videoNote () {
    const { video_note } = this.payload

    if (!video_note) {
      return
    }

    return new VideoNoteAttachment(video_note)
  }

  /** Message is a voice message, information about the file */
  get voice () {
    const { voice } = this.payload

    if (!voice) {
      return
    }

    return new VoiceAttachment(voice)
  }

  /**
   * Caption for the animation, audio, document, photo, video or voice,
   * 0-1024 characters
   */
  get caption () {
    return this.payload.caption
  }

  /**
   * For messages with a caption, special entities like usernames, URLs, bot
   * commands, etc. that appear in the caption
   */
  get captionEntities () {
    const { caption_entities } = this.payload

    if (!caption_entities) {
      return []
    }

    return caption_entities.map(entity => new MessageEntity(entity))
  }

  /** Message is a shared contact, information about the contact */
  get contact () {
    const { contact } = this.payload

    if (!contact) {
      return
    }

    return new Contact(contact)
  }

  /** Message is a dice with random value from 1 to 6 */
  get dice () {
    const { dice } = this.payload

    if (!dice) {
      return
    }

    return new Dice(dice)
  }

  /** Message is a game, information about the game */
  get game () {
    const { game } = this.payload

    if (!game) {
      return
    }

    return new Game(game)
  }

  /** Message is a native poll, information about the poll */
  get poll () {
    const { poll } = this.payload

    if (!poll) {
      return
    }

    return new Poll(poll)
  }

  /**
   * Message is a venue, information about the venue.
   * For backward compatibility, when this field is set,
   * the `location` field will also be set
   */
  get venue () {
    const { venue } = this.payload

    if (!venue) {
      return
    }

    return new Venue(venue)
  }

  /** Message is a shared location, information about the location */
  get location () {
    const { location } = this.payload

    if (!location) {
      return
    }

    return new Location(location)
  }

  /**
   * Inline keyboard attached to the message.
   *
   * `login_url` buttons are represented as ordinary `url` buttons.
   */
  get replyMarkup () {
    const { reply_markup } = this.payload

    if (!reply_markup) {
      return
    }

    return new InlineKeyboardMarkup(reply_markup)
  }

  /** The domain name of the website on which the user has logged in. */
  get connectedWebsite () {
    return this.payload.connected_website
  }

  /** Telegram Passport data */
  get passportData () {
    const { passport_data } = this.payload

    if (!passport_data) {
      return
    }

    return new PassportData(passport_data)
  }

  // Events

  /**
   * New members that were added to the group or supergroup and information
   * about them (the bot itself may be one of these members)
   */
  get newChatMembers () {
    const { new_chat_members } = this.payload

    if (!new_chat_members) {
      return []
    }

    return new_chat_members.map(member => new User(member))
  }

  /**
   * A member was removed from the group, information about them (this member
   * may be the bot itself)
   */
  get leftChatMember () {
    const { left_chat_member } = this.payload

    if (!left_chat_member) {
      return
    }

    return new User(left_chat_member)
  }

  /** A chat title was changed to this value */
  get newChatTitle () {
    return this.payload.new_chat_title
  }

  /** A chat photo was change to this value */
  get newChatPhoto () {
    const { new_chat_photo } = this.payload

    if (!new_chat_photo) {
      return []
    }

    return new_chat_photo.map(size => new PhotoSize(size))
  }

  /** Service message: the chat photo was deleted */
  get deleteChatPhoto () {
    return this.payload.delete_chat_photo
  }

  /** Service message: the group has been created */
  get groupChatCreated () {
    return this.payload.group_chat_created
  }

  /**
   * Service message: the supergroup has been created. This field can't be
   * received in a message coming through updates, because bot can't be a
   * member of a supergroup when it is created. It can only be found in
   * `replyMessage` if someone replies to a very first message in a
   * directly created supergroup.
   */
  get supergroupChatCreated () {
    return this.payload.supergroup_chat_created
  }

  /** Service message: auto-delete timer settings changed in the chat */
  get messageAutoDeleteTimerChanged () {
    const { message_auto_delete_timer_changed } = this.payload

    if (!message_auto_delete_timer_changed) {
      return
    }

    return new MessageAutoDeleteTimerChanged(message_auto_delete_timer_changed)
  }

  /**
   * Service message: the channel has been created. This field can't be
   * received in a message coming through updates, because bot can't be a
   * member of a channel when it is created. It can only be found in
   * `replyMessage` if someone replies to a very first message in a channel.
   */
  get channelChatCreated () {
    return this.payload.channel_chat_created
  }

  /**
   * The group has been migrated to a supergroup with the specified identifier.
   * This number may be greater than 32 bits and some programming languages may
   * have difficulty/silent defects in interpreting it. But it is smaller than
   * 52 bits, so a signed 64 bit integer or double-precision float type are
   * safe for storing this identifier.
   */
  get migrateToChatId () {
    return this.payload.migrate_to_chat_id
  }

  /**
   * The supergroup has been migrated from a group with the specified
   * identifier. This number may be greater than 32 bits and some programming
   * languages may have difficulty/silent defects in interpreting it. But it is
   * smaller than 52 bits, so a signed 64 bit integer or double-precision float
   * type are safe for storing this identifier.
   */
  get migrateFromChatId () {
    return this.payload.migrate_from_chat_id
  }

  /**
   * Specified message was pinned. Note that the Message object in this field
   * will not contain further `replyMessage` fields even if it is itself a
   * reply.
   */
  get pinnedMessage (): Omit<Message, 'replyMessage'> | undefined {
    const { pinned_message } = this.payload

    if (!pinned_message) {
      return
    }

    return new Message(pinned_message)
  }

  /** Message is an invoice for a payment, information about the invoice */
  get invoice () {
    const { invoice } = this.payload

    if (!invoice) {
      return
    }

    return new Invoice(invoice)
  }

  /**
   * Message is a service message about a successful payment,
   * information about the payment.
   */
  get successfulPayment () {
    const { successful_payment } = this.payload

    if (!successful_payment) {
      return
    }

    return new SuccessfulPayment(successful_payment)
  }

  /**
   * Service message.
   * A user in the chat triggered another user's proximity alert
   * while sharing Live Location.
   */
  get proximityAlertTriggered () {
    const { proximity_alert_triggered } = this.payload

    if (!proximity_alert_triggered) {
      return
    }

    return new ProximityAlertTriggered(proximity_alert_triggered)
  }

  /** Service message: video chat scheduled */
  get videoChatScheduled () {
    const { video_chat_scheduled } = this.payload

    if (!video_chat_scheduled) {
      return
    }

    return new VideoChatScheduled(video_chat_scheduled)
  }

  /** Service message: video chat started */
  get videoChatStarted () {
    const { video_chat_started } = this.payload

    if (!video_chat_started) {
      return
    }

    return new VideoChatStarted(video_chat_started)
  }

  /** Service message: video chat ended */
  get videoChatEnded () {
    const { video_chat_ended } = this.payload

    if (!video_chat_ended) {
      return
    }

    return new VideoChatEnded(video_chat_ended)
  }

  /** Service message: new participants invited to a video chat */
  get videoChatParticipantsInvited () {
    const { video_chat_participants_invited } = this.payload

    if (!video_chat_participants_invited) {
      return
    }

    return new VideoChatParticipantsInvited(video_chat_participants_invited)
  }

  /** Service message: data sent by a Web App */
  get webAppData () {
    const { web_app_data } = this.payload

    if (!web_app_data) {
      return
    }

    return new WebAppData(web_app_data)
  }
}

inspectable(Message, {
  serialize (update) {
    const payload = {
      id: update.id,
      from: update.from,
      senderChat: update.senderChat,
      createdAt: update.createdAt,
      chat: update.chat,
      forwardMessage: update.forwardedMessage,
      isAutomaticForward: update.isAutomaticForward,
      replyMessage: update.replyMessage,
      viaBot: update.viaBot,
      updatedAt: update.updatedAt,
      mediaGroupId: update.mediaGroupId,
      authorSignature: update.authorSignature,
      text: update.text,
      entities: update.entities,

      // Attachments

      animation: update.animation,
      audio: update.audio,
      document: update.document,
      photo: update.photo,
      sticker: update.sticker,
      video: update.video,
      videoNote: update.videoNote,
      voice: update.voice,

      caption: update.caption,
      captionEntities: update.captionEntities,

      contact: update.contact,
      dice: update.dice,
      game: update.game,
      poll: update.poll,
      venue: update.venue,
      location: update.location,

      // Events

      newChatMembers: update.newChatMembers,
      leftChatMember: update.leftChatMember,
      newChatTitle: update.newChatTitle,
      newChatPhoto: update.newChatPhoto,
      deleteChatPhoto: update.deleteChatPhoto,
      groupChatCreated: update.groupChatCreated,
      supergroupChatCreated: update.supergroupChatCreated,
      channelChatCreated: update.channelChatCreated,
      migrateToChatId: update.migrateToChatId,
      migrateFromChatId: update.migrateFromChatId,

      pinnedMessage: update.pinnedMessage,
      invoice: update.invoice,
      successfulPayment: update.successfulPayment,
      connectedWebsite: update.connectedWebsite,
      passportData: update.passportData,
      videoChatStarted: update.videoChatStarted,
      videoChatEnded: update.videoChatEnded,
      videoChatParticipantsInvited: update.videoChatParticipantsInvited,

      replyMarkup: update.replyMarkup
    }

    return filterPayload(payload)
  }
})
