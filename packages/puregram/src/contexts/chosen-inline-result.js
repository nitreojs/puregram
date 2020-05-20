let { inspect } = require('util');

let Context = require('./context');

let User = require('../structures/user');

let { filterPayload } = require('../utils');

class ChosenInlineResult extends Context {
  constructor(telegram, update) {
    super(telegram, 'chosen_inline_result');

    this.update = update;
  }

  get id() {
    return this.update.result_id;
  }

  get from() {
    return new User(this.update.from);
  }

  get senderId() {
    return this.from.id;
  }

  get query() {
    return this.update.query;
  }

  get location() {
    return this.update.location || null;
  }

  get inlineMessageId() {
    return this.update.inline_message_id || null;
  }

  async send(text = '', params = {}) {
    let response = await this.telegram.api.sendMessage({
      chat_id: this.chatId || this.senderId,
      text,
      ...params,
    });

    return new MessageContext(this.telegram, response);
  }

  async reply(text, params = {}) {
    return this.send(text, {
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

  async sendMediaGroup(media, params = {}) {
    let response = await this.telegram.api.sendMediaGroup({
      chat_id: this.chatId,
      media,
      ...params,
    });

    return new MessageContext(this.telegram, response);
  }

  replyWithMediaGroup(media, params = {}) {
    return this.sendMediaGroup(media, {
      reply_to_message_id: this.id,
      ...params,
    });
  }

  async sendLocation(location, params = {}) {
    let response = await this.telegram.api.sendLocation({
      chat_id: this.chatId,
      ...location,
      ...params
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
      ? new MessageContext(this.telegram, response)
      : true;
  }

  async stopMessageLiveLocation(params = {}) {
    let response = await this.telegram.api.stopMessageLiveLocation({
      chat_id: this.chatId,
      message_id: this.id,
      ...params,
    });

    return response === true
      ? true
      : new MessageContext(this.telegram, response);
  }

  async sendVenue(venue, params = {}) {
    let response = await this.telegram.api.sendVenue({
      chat_id: this.chatId,
      ...venue,
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
      ...contact,
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
      ...poll,
      ...params,
    });

    return new MessageContext(this.telegram, response);
  }

  replyWithPoll(poll, params = {}) {
    return this.sendPoll(poll, {
      reply_to_message_id: this.id,
      ...params,
    });
  }

  async stopPoll(id, params = {}) {
    let response = await this.telegram.api.stopPoll({
      chat_id: this.chatId,
      message_id: id,
      ...params,
    });

    return new Poll(response);
  }

  replyWithContact(poll, params = {}) {
    return this.sendPoll(poll, {
      reply_to_message_id: this.id,
      ...params,
    });
  }

  sendChatAction(action, params = {}) {
    return this.telegram.api.sendChatAction({
      chat_id: this.chatId,
      action,
      ...params,
    });
  }

  async getUserProfilePhotos(params = {}) {
    return new UserProfilePhotos(
      await this.telegram.api.getUserProfilePhotos({
        user_id: this.chatId,
        ...params,
      })
    );
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

  async sendDice(params = {}) {
    let response = await this.telegram.api.sendDice({
      chat_id: this.chatId,
      ...params
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
      from: this.from,
      senderId: this.senderId,
      query: this.query,
      location: this.location,
      inlineMessageId: this.inlineMessageId,
    };

    let filtered = filterPayload(payloadToInspect);

    let payload = inspect(filtered, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = ChosenInlineResult;
