import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Structure } from '../../types/interfaces'

import { User } from './user'
import { Chat } from './chat'
import { ForwardedMessage } from './forwarded-message'
import { MessageEntity } from './message-entity'
import { PhotoSize } from './photo-size'
import { Contact } from './contact'
import { Game } from './game'
import { Poll } from './poll'
import { Venue } from './venue'
import { Location } from './location'
import { Invoice } from './invoice'
import { Dice } from './dice'
import { SuccessfulPayment } from './successful-payment'
import { PassportData } from './passport-data'
import { InlineKeyboardMarkup } from './inline-keyboard-markup'
import { MessageAutoDeleteTimerChanged } from './message-auto-delete-timer-changed'
import { VideoChatEnded } from './video-chat-ended'
import { VideoChatParticipantsInvited } from './video-chat-participants-invited'
import { VideoChatStarted } from './video-chat-started'
import { VideoChatScheduled } from './video-chat-scheduled'
import { ProximityAlertTriggered } from './proximity-alert-triggered'
import { WebAppData } from './web-app-data'
import { ForumTopicCreated } from './forum-topic-created'
import { ForumTopicEdited } from './forum-topic-edited'
import { ForumTopicClosed } from './forum-topic-closed'
import { ForumTopicReopened } from './forum-topic-reopened'

import {
  AnimationAttachment,
  AudioAttachment,
  DocumentAttachment,
  VideoAttachment,
  VideoNoteAttachment,
  StickerAttachment,
  VoiceAttachment
} from '../attachments'
import { WriteAccessAllowed } from './write-access-allowed'
import { GeneralForumTopicHidden } from './general-forum-topic-hidden'
import { GeneralForumTopicUnhidden } from './general-forum-topic-unhidden'
import { UserShared } from './user-shared'
import { ChatShared } from './chat-shared'

/** This object represents a message. */
export class Message implements Structure {
  constructor (public payload: Interfaces.TelegramMessage) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Unique message identifier inside this chat */
  get id () {
    return this.payload.message_id
  }

  /** Unique identifier of a message thread to which the message belongs; for supergroups only */
  get threadId () {
    return this.payload.message_thread_id
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
    return new Chat(this.payload.chat)
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

  /** `true`, if the message is sent to a forum topic */
  isTopicMessage () {
    return this.payload.is_topic_message
  }

  /** `true`, if the message is a channel post that was automatically forwarded to the connected discussion group */
  isAutomaticForward () {
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
  hasProtectedContent () {
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
      return
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
      return
    }

    return caption_entities.map(entity => new MessageEntity(entity))
  }

  /** `true`, if the message media is covered by a spoiler animation */
  hasMediaSpoiler () {
    return this.payload.has_media_spoiler as true | undefined
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
      return
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
      return
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

  /** Service message: a user was shared with the bot */
  get userShared () {
    const { user_shared } = this.payload

    if (!user_shared) {
      return
    }

    return new UserShared(user_shared)
  }

  /** Service message: a chat was shared with the bot */
  get chatShared () {
    const { chat_shared } = this.payload

    if (!chat_shared) {
      return
    }

    return new ChatShared(chat_shared)
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

  /** Service message: the user allowed the bot added to the attachment menu to write messages */
  get writeAccessAllowed () {
    const { write_access_allowed } = this.payload

    if (!write_access_allowed) {
      return
    }

    return new WriteAccessAllowed(write_access_allowed)
  }

  /** Service message: forum topic created */
  get forumTopicCreated () {
    const { forum_topic_created } = this.payload

    if (!forum_topic_created) {
      return
    }

    return new ForumTopicCreated(forum_topic_created)
  }

  /** Service message: forum topic edited */
  get forumTopicEdited () {
    const { forum_topic_edited } = this.payload

    if (!forum_topic_edited) {
      return
    }

    return new ForumTopicEdited(forum_topic_edited)
  }

  /** Service message: forum topic closed */
  get forumTopicClosed () {
    const { forum_topic_closed } = this.payload

    if (!forum_topic_closed) {
      return
    }

    return new ForumTopicClosed(forum_topic_closed)
  }

  /** Service message: forum topic reopened */
  get forumTopicReopened () {
    const { forum_topic_reopened } = this.payload

    if (!forum_topic_reopened) {
      return
    }

    return new ForumTopicReopened(forum_topic_reopened)
  }

  /** Service message: the 'General' forum topic hidden */
  get generalForumTopicHidden () {
    const { general_forum_topic_hidden } = this.payload

    if (!general_forum_topic_hidden) {
      return
    }

    return new GeneralForumTopicHidden(general_forum_topic_hidden)
  }

  /** Service message: the 'General' forum topic unhidden */
  get generalForumTopicUnhidden () {
    const { general_forum_topic_unhidden } = this.payload

    if (!general_forum_topic_unhidden) {
      return
    }

    return new GeneralForumTopicUnhidden(general_forum_topic_unhidden)
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

  toJSON () {
    return this.payload
  }
}

inspectable(Message, {
  serialize (struct) {
    const payload = {
      id: struct.id,
      from: struct.from,
      senderChat: struct.senderChat,
      createdAt: struct.createdAt,
      chat: struct.chat,
      forwardMessage: struct.forwardedMessage,
      isAutomaticForward: struct.isAutomaticForward(),
      replyMessage: struct.replyMessage,
      viaBot: struct.viaBot,
      updatedAt: struct.updatedAt,
      mediaGroupId: struct.mediaGroupId,
      authorSignature: struct.authorSignature,
      text: struct.text,
      entities: struct.entities,

      // Attachments

      animation: struct.animation,
      audio: struct.audio,
      document: struct.document,
      photo: struct.photo,
      sticker: struct.sticker,
      video: struct.video,
      videoNote: struct.videoNote,
      voice: struct.voice,

      caption: struct.caption,
      captionEntities: struct.captionEntities,

      contact: struct.contact,
      dice: struct.dice,
      game: struct.game,
      poll: struct.poll,
      venue: struct.venue,
      location: struct.location,

      // Events

      newChatMembers: struct.newChatMembers,
      leftChatMember: struct.leftChatMember,
      newChatTitle: struct.newChatTitle,
      newChatPhoto: struct.newChatPhoto,
      deleteChatPhoto: struct.deleteChatPhoto,
      groupChatCreated: struct.groupChatCreated,
      supergroupChatCreated: struct.supergroupChatCreated,
      channelChatCreated: struct.channelChatCreated,
      migrateToChatId: struct.migrateToChatId,
      migrateFromChatId: struct.migrateFromChatId,

      pinnedMessage: struct.pinnedMessage,
      invoice: struct.invoice,
      successfulPayment: struct.successfulPayment,
      connectedWebsite: struct.connectedWebsite,
      passportData: struct.passportData,
      videoChatScheduled: struct.videoChatScheduled,
      videoChatStarted: struct.videoChatStarted,
      videoChatEnded: struct.videoChatEnded,
      videoChatParticipantsInvited: struct.videoChatParticipantsInvited,

      replyMarkup: struct.replyMarkup
    }

    return filterPayload(payload)
  }
})
