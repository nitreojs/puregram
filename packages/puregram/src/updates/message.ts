import { inspectable } from 'inspectable';

import {
  TelegramMessage,
  ForwardMessagePayload,
  TelegramMessageEntity,
  TelegramPhotoSize,
  TelegramUser
} from '../interfaces';

import { User } from '../common/structures/user';
import { Chat } from '../common/structures/chat';
import { ForwardMessage } from '../common/structures/forward-message';
import { MessageEntity } from '../common/structures/message-entity';
import { PhotoSize } from '../common/structures/photo-size';
import { Contact } from '../common/structures/contact';
import { Game } from '../common/structures/game';
import { Poll } from '../common/structures/poll';
import { Venue } from '../common/structures/venue';
import { Location } from '../common/structures/location';
import { Invoice } from '../common/structures/invoice';
import { Dice } from '../common/structures/dice';
import { SuccessfulPayment } from '../common/structures/successful-payment';
import { PassportData } from '../common/structures/passport-data';
import { InlineKeyboardMarkup } from '../common/structures/inline-keyboard-markup';

import {
  Animation,
  Audio,
  Document,
  Video,
  VideoNote,
  Sticker,
  Voice
} from '../common/attachments';

import { filterPayload } from '../utils/helpers';
import { ProximityAlertTriggered } from '../common/structures/proximity-alert-triggered';

/** This object represents a message. */
export class Message {
  public payload: TelegramMessage;

  constructor(payload: TelegramMessage) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Unique message identifier inside this chat */
  public get id(): number {
    return this.payload.message_id;
  }

  /** Sender, empty for messages sent to channels */
  public get from(): User | undefined {
    const { from } = this.payload;

    if (!from) return undefined;

    return new User(from);
  }

  /**
   * Sender of the message, sent on behalf of a chat.
   * The channel itself for channel messages.
   * The supergroup itself for messages from anonymous group administrators.
   * The linked channel for messages automatically forwarded to the discussion group
   */
  public get senderChat(): Chat | undefined {
    const { sender_chat } = this.payload;

    if (!sender_chat) return undefined;

    return new Chat(sender_chat);
  }

  /** Date the message was sent in Unix time */
  public get createdAt(): number {
    return this.payload.date;
  }

  /** Conversation the message belongs to */
  public get chat(): Chat | undefined {
    const { chat } = this.payload;

    if (!chat) return undefined;

    return new Chat(chat);
  }

  /** Forwarded message if there is any */
  public get forwardMessage(): ForwardMessage | undefined {
    const {
      forward_date,
      forward_from,
      forward_from_chat,
      forward_from_message_id,
      forward_sender_name,
      forward_signature
    } = this.payload;

    if (!forward_date) return undefined;

    const forwardPayload: ForwardMessagePayload = {
      date: forward_date,
      from: forward_from,
      from_chat: forward_from_chat,
      from_message_id: forward_from_message_id,
      sender_name: forward_sender_name,
      signature: forward_signature
    };

    return new ForwardMessage(forwardPayload);
  }

  /** For replies, the original message */
  public get replyMessage(): Omit<Message, 'replyMessage'> | undefined {
    const { reply_to_message } = this.payload;

    if (!reply_to_message) return undefined;

    return new Message(reply_to_message);
  }

  /** Bot through which the message was sent */
  public get viaBot(): User | undefined {
    const { via_bot } = this.payload;

    if (!via_bot) return undefined;

    return new User(via_bot);
  }

  /** Date the message was last edited in Unix time */
  public get updatedAt(): number | undefined {
    return this.payload.edit_date;
  }

  /** The unique identifier of a media message group this message belongs to */
  public get mediaGroupId(): string | undefined {
    return this.payload.media_group_id;
  }

  /**
   * Signature of the post author for messages in channels,
   * or the custom title of an anonymous group administrator
   */
  public get authorSignature(): string | undefined {
    return this.payload.author_signature;
  }

  /**
   * For text messages, the actual UTF-8 text of the message, 0-4096 characters
   */
  public get text(): string | undefined {
    return this.payload.text;
  }

  /**
   * For text messages, special entities like usernames, URLs, bot commands,
   * etc. that appear in the text
   */
  public get entities(): MessageEntity[] {
    const { entities } = this.payload;

    if (!entities) return [];

    return entities.map(
      (entity: TelegramMessageEntity) => new MessageEntity(entity)
    );
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
  public get animation(): Animation | undefined {
    const { animation } = this.payload;

    if (!animation) return undefined;

    return new Animation(animation);
  }

  /** Message is an audio file, information about the file */
  public get audio(): Audio | undefined {
    const { audio } = this.payload;

    if (!audio) return undefined;

    return new Audio(audio);
  }

  /** Message is a general file, information about the file */
  public get document(): Document | undefined {
    const { document } = this.payload;

    if (!document) return undefined;

    return new Document(document);
  }

  /** Message is a photo, available sizes of the photo */
  public get photo(): PhotoSize[] | undefined {
    const { photo } = this.payload;

    if (!photo) return undefined;

    return photo.map(
      (size: TelegramPhotoSize) => new PhotoSize(size)
    );
  }

  /** Message is a sticker, information about the sticker */
  public get sticker(): Sticker | undefined {
    const { sticker } = this.payload;

    if (!sticker) return undefined;

    return new Sticker(sticker);
  }

  /** Message is a video, information about the video */
  public get video(): Video | undefined {
    const { video } = this.payload;

    if (!video) return undefined;

    return new Video(video);
  }

  /** Message is a video note, information about the video message */
  public get videoNote(): VideoNote | undefined {
    const { video_note } = this.payload;

    if (!video_note) return undefined;

    return new VideoNote(video_note);
  }

  /** Message is a voice message, information about the file */
  public get voice(): Voice | undefined {
    const { voice } = this.payload;

    if (!voice) return undefined;

    return new Voice(voice);
  }

  /**
   * Caption for the animation, audio, document, photo, video or voice,
   * 0-1024 characters
   */
  public get caption(): string | undefined {
    return this.payload.caption;
  }

  /**
   * For messages with a caption, special entities like usernames, URLs, bot
   * commands, etc. that appear in the caption
   */
  public get captionEntities(): MessageEntity[] {
    const { caption_entities } = this.payload;

    if (!caption_entities) return [];

    return caption_entities.map(
      (entity: TelegramMessageEntity) => new MessageEntity(entity)
    );
  }

  /** Message is a shared contact, information about the contact */
  public get contact(): Contact | undefined {
    const { contact } = this.payload;

    if (!contact) return undefined;

    return new Contact(contact);
  }

  /** Message is a dice with random value from 1 to 6 */
  public get dice(): Dice | undefined {
    const { dice } = this.payload;

    if (!dice) return undefined;

    return new Dice(dice);
  }

  /** Message is a game, information about the game */
  public get game(): Game | undefined {
    const { game } = this.payload;

    if (!game) return undefined;

    return new Game(game);
  }

  /** Message is a native poll, information about the poll */
  public get poll(): Poll | undefined {
    const { poll } = this.payload;

    if (!poll) return undefined;

    return new Poll(poll);
  }

  /**
   * Message is a venue, information about the venue.
   * For backward compatibility, when this field is set,
   * the `location` field will also be set
   */
  public get venue(): Venue | undefined {
    const { venue } = this.payload;

    if (!venue) return undefined;

    return new Venue(venue);
  }

  /** Message is a shared location, information about the location */
  public get location(): Location | undefined {
    const { location } = this.payload;

    if (!location) return undefined;

    return new Location(location);
  }

  // Events

  /**
   * New members that were added to the group or supergroup and information
   * about them (the bot itself may be one of these members)
   */
  public get newChatMembers(): User[] {
    const { new_chat_members } = this.payload;

    if (!new_chat_members) return [];

    return new_chat_members.map(
      (member: TelegramUser) => new User(member)
    );
  }

  /**
   * A member was removed from the group, information about them (this member
   * may be the bot itself)
   */
  public get leftChatMember(): User | undefined {
    const { left_chat_member } = this.payload;

    if (!left_chat_member) return undefined;

    return new User(left_chat_member);
  }

  /** A chat title was changed to this value */
  public get newChatTitle(): string | undefined {
    return this.payload.new_chat_title;
  }

  /** A chat photo was change to this value */
  public get newChatPhoto(): PhotoSize[] {
    const { new_chat_photo } = this.payload;

    if (!new_chat_photo) return [];

    return new_chat_photo.map(
      (size: TelegramPhotoSize) => new PhotoSize(size)
    );
  }

  /** Service message: the chat photo was deleted */
  public get deleteChatPhoto(): boolean | undefined {
    return this.payload.delete_chat_photo;
  }

  /** Service message: the group has been created */
  public get groupChatCreated(): boolean | undefined {
    return this.payload.group_chat_created;
  }

  /**
   * Service message: the supergroup has been created. This field can't be
   * received in a message coming through updates, because bot can't be a
   * member of a supergroup when it is created. It can only be found in
   * `replyMessage` if someone replies to a very first message in a
   * directly created supergroup.
   */
  public get supergroupChatCreated(): boolean | undefined {
    return this.payload.supergroup_chat_created;
  }

  /**
   * Service message: the channel has been created. This field can't be
   * received in a message coming through updates, because bot can't be a
   * member of a channel when it is created. It can only be found in
   * `replyMessage` if someone replies to a very first message in a channel.
   */
  public get channelChatCreated(): boolean | undefined {
    return this.payload.channel_chat_created;
  }

  /**
   * The group has been migrated to a supergroup with the specified identifier.
   * This number may be greater than 32 bits and some programming languages may
   * have difficulty/silent defects in interpreting it. But it is smaller than
   * 52 bits, so a signed 64 bit integer or double-precision float type are
   * safe for storing this identifier.
   */
  public get migrateToChatId(): number | undefined {
    return this.payload.migrate_to_chat_id;
  }

  /**
   * The supergroup has been migrated from a group with the specified
   * identifier. This number may be greater than 32 bits and some programming
   * languages may have difficulty/silent defects in interpreting it. But it is
   * smaller than 52 bits, so a signed 64 bit integer or double-precision float
   * type are safe for storing this identifier.
   */
  public get migrateFromChatId(): number | undefined {
    return this.payload.migrate_from_chat_id;
  }

  /**
   * Specified message was pinned. Note that the Message object in this field
   * will not contain further `replyMessage` fields even if it is itself a
   * reply.
   */
  public get pinnedMessage(): Omit<Message, 'replyMessage'> | undefined {
    const { pinned_message } = this.payload;

    if (!pinned_message) return undefined;

    return new Message(pinned_message);
  }

  /** Message is an invoice for a payment, information about the invoice */
  public get invoice(): Invoice | undefined {
    const { invoice } = this.payload;

    if (!invoice) return undefined;

    return new Invoice(invoice);
  }

  /**
   * Message is a service message about a successful payment,
   * information about the payment.
   */
  public get successfulPayment(): SuccessfulPayment | undefined {
    const { successful_payment } = this.payload;

    if (!successful_payment) return undefined;

    return new SuccessfulPayment(successful_payment);
  }

  /** The domain name of the website on which the user has logged in. */
  public get connectedWebsite(): string | undefined {
    return this.payload.connected_website;
  }

  /** Telegram Passport data */
  public get passportData(): PassportData | undefined {
    const { passport_data } = this.payload;

    if (!passport_data) return undefined;

    return new PassportData(passport_data);
  }

  /**
   * Service message.
   * A user in the chat triggered another user's proximity alert
   * while sharing Live Location.
   */
  public get proximityAlertTriggered(): ProximityAlertTriggered | undefined {
    const { proximity_alert_triggered } = this.payload;

    if (!proximity_alert_triggered) return undefined;

    return new ProximityAlertTriggered(proximity_alert_triggered);
  }

  /**
   * Inline keyboard attached to the message.
   *
   * `login_url` buttons are represented as ordinary `url` buttons.
   */
  public get replyMarkup(): InlineKeyboardMarkup | undefined {
    const { reply_markup } = this.payload;

    if (!reply_markup) return undefined;

    return new InlineKeyboardMarkup(reply_markup);
  }
}

inspectable(Message, {
  serialize(message: Message) {
    const payload = {
      id: message.id,
      from: message.from,
      senderChat: message.senderChat,
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

      // Attachments

      animation: message.animation,
      audio: message.audio,
      document: message.document,
      photo: message.photo,
      sticker: message.sticker,
      video: message.video,
      videoNote: message.videoNote,
      voice: message.voice,

      caption: message.caption,
      captionEntities: message.captionEntities,

      contact: message.contact,
      dice: message.dice,
      game: message.game,
      poll: message.poll,
      venue: message.venue,
      location: message.location,

      // Events

      newChatMembers: message.newChatMembers,
      leftChatMember: message.leftChatMember,
      newChatTitle: message.newChatTitle,
      newChatPhoto: message.newChatPhoto,
      deleteChatPhoto: message.deleteChatPhoto,
      groupChatCreated: message.groupChatCreated,
      supergroupChatCreated: message.supergroupChatCreated,
      channelChatCreated: message.channelChatCreated,
      migrateToChatId: message.migrateToChatId,
      migrateFromChatId: message.migrateFromChatId,

      pinnedMessage: message.pinnedMessage,
      invoice: message.invoice,
      successfulPayment: message.successfulPayment,
      connectedWebsite: message.connectedWebsite,
      passportData: message.passportData,
      replyMarkup: message.replyMarkup
    };

    return filterPayload(payload);
  }
});
