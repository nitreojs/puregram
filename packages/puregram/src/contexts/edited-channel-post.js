let { inspect } = require('util');

let Context = require('./context');
let ReplyMessageContext = require('./reply-message');

let AnimationAttachment = require('../structures/animation');
let AudioAttachment = require('../structures/audio');
let ContactAttachment = require('../structures/contact');
let DocumentAttachment = require('../structures/document');
let Game = require('../structures/game');
let LocationAttachment = require('../structures/location');
let MessageEntity = require('../structures/message-entity');
let PhotoSize = require('../structures/photo-size');
let PollAttachment = require('../structures/poll');
let StickerAttachment = require('../structures/sticker');
let VenueAttachment = require('../structures/venue');
let VideoNoteAttachment = require('../structures/video-note');
let VideoAttachment = require('../structures/video');
let VoiceAttachment = require('../structures/voice');

let User = require('../structures/user');
let Chat = require('../structures/chat');
let EVENTS = require('../structures/events');

let { filterPayload } = require('../utils');

class EditedChannelPostContext extends Context {
  constructor(telegram, update) {
    super(telegram, 'edited_channel_post');

    this.update = update;
  }

  get id() {
    return this.update.message_id;
  }

  get from() {
    let { from } = this.update;

    if (!from) return null;

    return new User(from);
  }

  get senderId() {
    return this.from ? this.from.id : null;
  }

  get isOutbox() {
    return this.from
  }

  get date() {
    return this.update.date || null;
  }

  get chat() {
    let { chat } = this.update;

    return new Chat(chat);
  }

  get chatId() {
    return this.chat.id;
  }

  get chatType() {
    return this.chat.type;
  }

  get forwardFrom() {
    let { forward_from } = this.update;

    if (!forward_from) return null;

    return new User(forward_from);
  }

  get forwardFromChat() {
    let { forward_from_chat: forwardFromChat } = this.update;

    if (!forwardFromChat) return null;

    return new Chat(forwardFromChat);
  }

  get forwardFromMessageId() {
    return this.update.forward_from_message_id || null;
  }

  get forwardSignature() {
    return this.update.forward_signature || null;
  }

  get forwardSenderName() {
    return this.update.forward_sender_name || null;
  }

  get forwardDate() {
    return this.update.forward_date || null;
  }

  get isForward() {
    return this.forwardFrom !== null;
  }

  get replyMessage() {
    let { reply_to_message: replyMessage } = this.update;

    if (!replyMessage) return null;

    return new ReplyMessageContext(replyMessage);
  }

  get editDate() {
    return this.update.edit_date || null;
  }

  get mediaGroupId() {
    return this.update.media_group_id || null;
  }

  get authorSignature() {
    return this.update.author_signature || null;
  }

  get text() {
    return this.update.text || null;
  }

  get entities() {
    let { entities } = this.update;

    if (!entities) return null;

    return entities.map(
      e => new MessageEntity(e),
    );
  }

  get captionEntities() {
    let { caption_entities } = this.update;

    if (!caption_entities) return null;

    return caption_entities.map(
      e => new MessageEntity(e),
    );
  }

  get audio() {
    let { audio } = this.update;

    return audio ? new AudioAttachment(audio) : null;
  }

  get document() {
    let { document } = this.update;

    return document ? new DocumentAttachment(document) : null;
  }

  get animation() {
    let { animation } = this.update;

    return animation ? new AnimationAttachment(animation) : null;
  }

  get game() {
    let { game } = this.update;

    return game ? new Game(game) : null;
  }

  get photo() {
    let { photo } = this.update;

    if (!photo) return null;

    return photo.map(
      e => new PhotoSize(e),
    );
  }

  get sticker() {
    let { sticker } = this.update;

    return sticker ? new StickerAttachment(sticker) : null;
  }

  get video() {
    let { video } = this.update;

    return video ? new VideoAttachment(video) : null;
  }

  get voice() {
    let { voice } = this.update;

    return voice ? new VoiceAttachment(voice) : null;
  }

  get videoNote() {
    let { video_note } = this.update;

    return video_note ? new VideoNoteAttachment(video_note) : null;
  }

  get caption() {
    return this.update.caption || null;
  }

  get contact() {
    let { contact } = this.update;

    return contact ? new ContactAttachment(contact) : null;
  }

  get location() {
    let { location } = this.update;

    return location ? new LocationAttachment(location) : null;
  }
  
  get venue() {
    let { venue } = this.update;

    return venue ? new VenueAttachment(venue) : null;
  }

  get poll() {
    let { poll } = this.update;

    return poll ? new PollAttachment(poll) : null;
  }

  get attachments() {
    let attachments = [];

    if (this.audio) attachments.push(this.audio);
    if (this.document) attachments.push(this.document);
    if (this.animation) attachments.push(this.animation);
    if (this.game) attachments.push(this.game);
    if (this.photo) attachments.push(this.photo);
    if (this.sticker) attachments.push(this.sticker);
    if (this.video) attachments.push(this.video);
    if (this.voice) attachments.push(this.voice);
    if (this.videoNote) attachments.push(this.videoNote);
    if (this.contact) attachments.push(this.contact);
    if (this.location) attachments.push(this.location);
    if (this.venue) attachments.push(this.venue);
    if (this.poll) attachments.push(this.poll);

    return attachments;
  }

  hasAttachments(type = null) {
    if (type === null) return this.attachments.length > 0;

    return this.attachments.some(
      attachment => attachment.type === type,
    );
  }

  getAttachments(type = null) {
    if (type === null) return this.attachments;

    return this.attachments.filter(
      attachment => attachment.type === type,
    );
  }

  get newChatMembers() {
    return this.update.new_chat_members || null;
  }

  get leftChatMember() {
    return this.update.left_chat_member || null;
  }

  get newChatTitle() {
    return this.update.new_chat_title || null;
  }

  get newChatPhoto() {
    return this.update.new_chat_photo || null;
  }

  get deleteChatPhoto() {
    return this.update.delete_chat_photo || null;
  }

  get groupChatCreated() {
    return this.update.group_chat_created || null;
  }

  get supergroupChatCreated() {
    return this.update.supergroup_chat_created || null;
  }

  get channelChatCreated() {
    return this.update.channel_chat_created || null;
  }

  get migrateToChatId() {
    return this.update.migrate_to_chat_id || null;
  }

  get migrateFromChatId() {
    return this.update.migrate_from_chat_id || null;
  }

  get pinnedMessage() {
    return this.update.pinned_message || null;
  }

  get invoice() {
    return this.update.invoice || null;
  }

  get successfulPayment() {
    return this.update.successful_payment || null;
  }

  get connectedWebsite() {
    return this.update.connected_website || null;
  }

  get passportData() {
    return this.update.passport_data || null;
  }

  get replyMarkup() {
    return this.update.reply_markup || null;
  }

  get isEvent() {
    return EVENTS.some(
      event => Boolean(this[event[0]]),
    );
  }

  get eventType() {
    if (!this.isEvent) return null;

    return EVENTS.find(
      event => Boolean(this[event[0]]),
    )[1];
  }

  get hasText() {
    return this.text !== null;
  }

  get hasForward() {
    return this.forwardFrom !== null;
  }

  get isPM() {
    return this.chatId === this.senderId;
  }

  async send(text = '',params = {}) {
    let response = await this.telegram.api.sendMessage({
      chat_id: this.chatId || this.senderId,
      text,
      ...params,
    });

    return new MessageContext(this.telegram, response);
  }

  async reply(text, params = {}) {
    return this.send(text = '',{
      reply_to_message_id: this.id,
      ...params,
    });
  }

  async sendPhoto(photo, params = {}) {
    let response = await this.telegram.api.sendPhoto({
      chat_id: this.chatId,
      photo,
      ...params,
    });

    return new MessageContext(this.telegram, response);
  }

  replyWithPhoto(photo, params = {}) {
    return this.sendPhoto(photo, {
      reply_to_message_id: this.id,
      ...params,
    });
  }

  async sendAudio(audio, params = {}) {
    let response = await this.telegram.api.sendAudio({
      chat_id: this.chatId,
      audio,
      ...params,
    });

    return new MessageContext(this.telegram, response);
  }

  replyWithAudio(audio, params = {}) {
    return this.sendAudio(audio, {
      reply_to_message_id: this.id,
      ...params,
    });
  }

  async sendVideo(video, params = {}) {
    let response = await this.telegram.api.sendVideo({
      chat_id: this.chatId,
      video,
      ...params,
    });

    return new MessageContext(this.telegram, response);
  }

  replyWithVideo(video, params = {}) {
    return this.sendVideo(video, {
      reply_to_message_id: this.id,
      ...params,
    });
  }

  async sendAnimation(animation, params = {}) {
    let response = await this.telegram.api.sendAnimation({
      chat_id: this.chatId,
      animation,
      ...params,
    });

    return new MessageContext(this.telegram, response);
  }

  replyWithAnimation(animation, params = {}) {
    return this.sendAnimation(animation, {
      reply_to_message_id: this.id,
      ...params,
    });
  }

  async sendVideoNote(videoNote, params = {}) {
    let response = await this.telegram.api.sendVideoNote({
      chat_id: this.chatId,
      video_note: videoNote,
      ...params,
    });

    return new MessageContext(this.telegram, response);
  }

  replyWithVideoNote(videoNote, params = {}) {
    return this.sendVideoNote(videoNote, {
      reply_to_message_id: this.id,
      ...params,
    });
  }

  async sendVoice(voice, params = {}) {
    let response = await this.telegram.api.sendVoice({
      chat_id: this.chatId,
      voice,
      ...params,
    });

    return new MessageContext(this.telegram, response);
  }

  replyWithVoice(voice, params = {}) {
    return this.sendVoice(voice, {
      reply_to_message_id: this.id,
      ...params,
    });
  }

  async sendMediaGroup(mediaGroup, params = {}) {
    let response = await this.telegram.api.sendMediaGroup({
      chat_id: this.chatId,
      media_group: mediaGroup,
      ...params,
    });

    return new MessageContext(this.telegram, response);
  }

  replyWithMediaGroup(mediaGroup, params = {}) {
    return this.sendMediaGroup(mediaGroup, {
      reply_to_message_id: this.id,
      ...params,
    });
  }

  async sendLocation(location, params = {}) {
    let response = await this.telegram.api.sendLocation({
      chat_id: this.chatId,
      location,
      ...params,
    });

    return new MessageContext(this.telegram, response);
  }

  replyWithLocation(location, params = {}) {
    return this.sendLocation(location, {
      reply_to_message_id: this.id,
      ...params,
    });
  }

  async editMessageLiveLocation(params = {}) {
    let response = await this.telegram.api.editMessageLiveLocation({
      chat_id: this.chatId,
      message_id: this.id,
      ...params,
    });

    return response !== true
      ? new EditedMessageContext(this.telegram, response)
      : true;
  }

  async sendVenue(venue, params = {}) {
    let response = await this.telegram.api.sendVenue({
      chat_id: this.chatId,
      venue,
      ...params,
    });

    return new MessageContext(this.telegram, response);
  }

  replyWithVenue(venue, params = {}) {
    return this.sendVenue(venue, {
      reply_to_message_id: this.id,
      ...params,
    });
  }

  async sendContact(contact, params = {}) {
    let response = await this.telegram.api.sendContact({
      chat_id: this.chatId,
      contact,
      ...params,
    });

    return new MessageContext(this.telegram, response);
  }

  replyWithContact(contact, params = {}) {
    return this.sendContact(contact, {
      reply_to_message_id: this.id,
      ...params,
    });
  }

  async sendPoll(poll, params = {}) {
    let response = await this.telegram.api.sendPoll({
      chat_id: this.chatId,
      poll,
      ...params,
    });

    return new MessageContext(this.telegram, response);
  }

  replyWithContact(poll, params = {}) {
    return this.sendPoll(poll, {
      reply_to_message_id: this.id,
      ...params,
    });
  }

  async sendChatAction(action, params = {}) {
    return this.telegram.api.sendChatAction({
      chat_id: this.chatId,
      action,
      ...params,
    });
  }

  async editMessageText(text, params = {}) {
    let response = await this.telegram.api.editMessageText({
      chat_id: this.chatId,
      message_id: this.id,
      text,
      ...params,
    });

    return response !== true
      ? new MessageContext(this.telegram, response)
      : true;
  }

  async editMessageCaption(caption, params = {}) {
    let response = await this.telegram.api.editMessageCaption({
      chat_id: this.chatId,
      message_id: this.id,
      caption,
      ...params,
    });

    return response !== true
      ? new MessageContext(this.telegram, response)
      : true;
  }

  async editMessageMedia(media, params = {}) {
    let response = await this.telegram.api.editMessageMedia({
      chat_id: this.chatId,
      message_id: this.id,
      media,
      ...params,
    });

    return response !== true
      ? new MessageContext(this.telegram, response)
      : true;
  }

  async editMessageReplyMarkup(replyMarkup, params = {}) {
    let response = await this.telegram.api.editMessageReplyMarkup({
      chat_id: this.chatId,
      message_id: this.id,
      reply_markup: replyMarkup,
      ...params,
    });

    return response !== true
      ? new MessageContext(this.telegram, response)
      : true;
  }

  deleteMessage(params = {}) {
    return this.telegram.api.deleteMessage({
      chat_id: this.chatId,
      message_id: this.id,
      ...params,
    });
  }

  async sendSticker(sticker, params = {}) {
    let response = await this.telegram.api.sendSticker({
      chat_id: this.chatId,
      sticker,
      ...params,
    });

    return new MessageContext(this.telegram, response);
  }

  async sendDice(chatId = this.chatId) {
    let response = await this.telegram.api.sendDice({
      chat_id: chatId
    });

    return new MessageContext(this.telegram, response);
  }

  getMyCommands() {
    return this.telegram.api.getMyCommands();
  }

  setMyCommands() {
    return this.telegram.api.setMyCommands();
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
      chatType: this.chatType,
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

module.exports = EditedChannelPostContext;
