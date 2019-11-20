let { inspect } = require('util');

let User = require('../structures/user');
let Chat = require('../structures/chat');

let { filterPayload } = require('../utils');

class ReplyMessageContext {
  constructor(context) {
    this.context = context;
  }

  get id() {
    return this.context.message_id;
  }

  get from() {
    let { from } = this.context;

    if (!from) return null;

    return new User(from);
  }

  get senderId() {
    return this.from ? this.from.id : null;
  }

  get date() {
    return this.context.date || null;
  }

  get chat() {
    let { chat } = this.context;

    return new Chat(chat);
  }

  get chatId() {
    return this.chat.id;
  }

  get forwardFrom() {
    let { forward_from: forwardFrom } = this.context;

    if (!forwardFrom) return null;

    return new User(forwardFrom);
  }

  get forwardFromChat() {
    let { forward_from_chat: forwardFromChat } = this.context;

    if (!forwardFromChat) return null;

    return new Chat(forwardFromChat);
  }

  get forwardFromMessageId() {
    return this.context.forward_from_message_id || null;
  }

  get forwardSignature() {
    return this.context.forward_signature || null;
  }

  get forwardSenderName() {
    return this.context.forward_sender_name || null;
  }

  get forwardDate() {
    return this.context.forward_date || null;
  }

  get replyMessage() {
    let { reply_to_message: replyMessage } = this.context;

    if (!replyMessage) return null;

    return new ReplyMessageContext(replyMessage);
  }

  get editDate() {
    return this.context.edit_date || null;
  }

  get mediaGroupId() {
    return this.context.media_group_id || null;
  }

  get authorSignature() {
    return this.context.author_signature || null;
  }

  get text() {
    return this.context.text || null;
  }

  get entities() {
    return this.context.entities || null;
  }

  get captionEntities() {
    return this.context.caption_entities || null;
  }

  get audio() {
    return this.context.audio || null;
  }

  get document() {
    return this.context.document || null;
  }

  get animation() {
    return this.context.animation || null;
  }

  get game() {
    return this.context.game || null;
  }

  get photo() {
    return this.context.photo || null;
  }

  get sticker() {
    return this.context.sticker || null;
  }

  get video() {
    return this.context.video || null;
  }

  get voice() {
    return this.context.voice || null;
  }

  get videoNote() {
    return this.context.video_note || null;
  }

  get caption() {
    return this.context.caption || null;
  }

  get contact() {
    return this.context.contact || null;
  }

  get location() {
    return this.context.location || null;
  }
  
  get venue() {
    return this.context.venue || null;
  }

  get poll() {
    return this.context.poll || null;
  }

  get newChatMembers() {
    return this.context.new_chat_members || null;
  }

  get leftChatMember() {
    return this.context.left_chat_member || null;
  }

  get newChatTitle() {
    return this.context.new_chat_title || null;
  }

  get newChatPhoto() {
    return this.context.new_chat_photo || null;
  }

  get deleteChatPhoto() {
    return this.context.delete_chat_photo || null;
  }

  get groupChatCreated() {
    return this.context.group_chat_created || null;
  }

  get supergroupChatCreated() {
    return this.context.supergroup_chat_created || null;
  }

  get channelChatCreated() {
    return this.context.channel_chat_created || null;
  }

  get migrateToChatId() {
    return this.context.migrate_to_chat_id || null;
  }

  get migrateFromChatId() {
    return this.context.migrate_from_chat_id || null;
  }

  get pinnedMessage() {
    return this.context.pinned_message || null;
  }

  get invoice() {
    return this.context.invoice || null;
  }

  get successfulPayment() {
    return this.context.successful_payment || null;
  }

  get connectedWebsite() {
    return this.context.connected_website || null;
  }

  get passportData() {
    return this.context.passport_data || null;
  }

  get replyMarkup() {
    return this.context.reply_markup || null;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      id: this.id,
      from: filterPayload(this.from),
      senderId: this.senderId,
      date: this.date,
      chat: filterPayload(this.chat),
      chatId: this.chatId,
      forwardFrom: this.forwardFrom,
      forwardFromChat: this.forwardFromChat,
      forwardFromMessageId: this.forwardFromMessageId,
      forwardSignature: this.forwardSignature,
      forwardSenderName: this.forwardSenderName,
      forwardDate: this.forwardDate,
      replyMessage: this.replyMessage,
      editDate: this.editDate,
      mediaGroupId: this.mediaGroupId,
      authorSignature: this.authorSignature,
      text: this.text,
      entities: this.entities,
      captionEntities: this.captionEntities,
      audio: this.audio,
      document: this.document,
      animation: this.animation,
      game: this.game,
      photo: this.photo,
      sticker: this.sticker,
      video: this.video,
      voice: this.voice,
      videoNote: this.videoNote,
      caption: this.caption,
      contact: this.contact,
      location: this.location,
      venue: this.venue,
      poll: this.poll,
      newChatMembers: this.newChatMembers,
      leftChatMember: this.leftChatMember,
      newChatTitle: this.newChatTitle,
      newChatPhoto: this.newChatPhoto,
      deleteChatPhoto: this.deleteChatPhoto,
      groupChatCreated: this.groupChatCreated,
      supergroupChatCreated: this.supergroupChatCreated,
      channelChatCreated: this.channelChatCreated,
      migrateToChatId: this.migrateToChatId,
      migrateFromChatId: this.migrateFromChatId,
      pinnedMessage: this.pinnedMessage,
      invoice: this.invoice,
      successfulPayment: this.successfulPayment,
      connectedWebsite: this.connectedWebsite,
      passportData: this.passportData,
      replyMarkup: this.replyMarkup,
    };

    let filtered = filterPayload(payloadToInspect);

    let payload = inspect(filtered, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = ReplyMessageContext;
