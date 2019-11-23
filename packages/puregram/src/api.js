let fetch = require('node-fetch');

let APIError = require('./attachments/apierror');

class API {
  constructor(telegram) {
    this.telegram = telegram;
    this.baseApiUrl = this.telegram.baseApiUrl;
  }

  call(method, params) {
    return this.request({
      method,
      query: params,
    });
  }

  request(params) {
    return this.$request(params);
  }

  async $request({
    method,
    httpMethod = 'GET',
    query,
  }) {
    let url = `${this.baseApiUrl}/${method}`;

    if (query) {
      if (query.reply_markup) {
        query.reply_markup = query.reply_markup.toJSON();
      }

      url += `?${new URLSearchParams(query)}`;
    }

    let headers = {};

    if (method === 'getUpdates') {
      headers.connection = 'keep-alive';
    }

    try {
      let response = await fetch(url, {
        method: httpMethod,
        headers,
      });

      let json = await response.json();

      if (!json.ok) {
        throw new APIError(json.description);
      }

      return json.result;
    } catch (e) {
      throw new Error(e);
    }
  }

  getMe() {
    return this.request({
      method: 'getMe',
    });
  }

  getUpdates(params = {}) {
    return this.request({
      method: 'getUpdates',
      query: params,
    });
  }

  sendMessage(params = {}) {
    return this.request({
      method: 'sendMessage',
      query: params,
    });
  }

  forwardMessage(params = {}) {
    return this.request({
      method: 'forwardMessage',
      query: params,
    });
  }

  sendPhoto(params = {}) {
    return this.request({
      method: 'sendPhoto',
      query: params,
    });
  }

  sendAudio(params = {}) {
    return this.request({
      method: 'sendAudio',
      query: params,
    });
  }

  sendDocument(params = {}) {
    return this.request({
      method: 'sendDocument',
      query: params,
    });
  }
  
  sendVideo(params = {}) {
    return this.request({
      method: 'sendVideo',
      query: params,
    });
  }

  sendAnimation(params = {}) {
    return this.request({
      method: 'sendAnimation',
      query: params,
    });
  }

  sendVoice(params = {}) {
    return this.request({
      method: 'sendVoice',
      query: params,
    });
  }

  sendVideoNote(params = {}) {
    return this.request({
      method: 'sendVideoNote',
      query: params,
    });
  }

  sendMediaGroup(params = {}) {
    return this.request({
      method: 'sendMediaGroup',
      query: params,
    });
  }

  sendLocation(params = {}) {
    return this.request({
      method: 'sendLocation',
      query: params,
    });
  }

  editMessageLiveLocation(params = {}) {
    return this.request({
      method: 'editMessageLiveLocation',
      query: params,
    });
  }

  stopMessageLiveLocation(params = {}) {
    return this.request({
      method: 'stopMessageLiveLocation',
      query: params,
    });
  }

  sendVenue(params = {}) {
    return this.request({
      method: 'sendVenue',
      query: params,
    });
  }

  sendContact(params = {}) {
    return this.request({
      method: 'sendContact',
      query: params,
    });
  }

  sendPoll(params = {}) {
    return this.request({
      method: 'sendPoll',
      query: params,
    });
  }

  sendChatAction(params = {}) {
    return this.request({
      method: 'sendChatAction',
      query: params,
    });
  }

  getUserProfilePhotos(params = {}) {
    return this.request({
      method: 'getUserProfilePhotos',
      query: params,
    });
  }

  getFile(id) {
    return this.request({
      method: 'getFile',
      query: {
        file_id: id,
      },
    });
  }

  kickChatMember(params = {}) {
    return this.request({
      method: 'kickChatMember',
      query: params,
    });
  }

  unbanChatMember(params = {}) {
    return this.request({
      method: 'unbanChatMember',
      query: params,
    });
  }

  restrictChatMember(params = {}) {
    return this.request({
      method: 'restrictChatMember',
      query: params,
    });
  }

  promoteChatMember(params = {}) {
    return this.request({
      method: 'promoteChatMember',
      query: params,
    });
  }

  setChatPermissions(params = {}) {
    return this.request({
      method: 'setChatPermissions',
      query: params,
    });
  }

  exportChatInviteLink(params = {}) {
    return this.request({
      method: 'exportChatInviteLink',
      query: params,
    });
  }

  setChatPhoto(params = {}) {
    return this.request({
      method: 'setChatPhoto',
      query: params,
    });
  }

  deleteChatPhoto(chat) {
    return this.request({
      method: 'deleteChatPhoto',
      query: {
        chat_id: chat,
      },
    });
  }

  setChatTitle(params = {}) {
    return this.request({
      method: 'setChatTitle',
      query: params,
    });
  }

  setChatDescription(params = {}) {
    return this.request({
      method: 'setChatDescription',
      query: params,
    });
  }

  pinChatMessage(params = {}) {
    return this.request({
      method: 'pinChatMessage',
      query: params,
    });
  }

  unpinChatMessage(chat) {
    return this.request({
      method: 'unpinChatMessage',
      query: {
        chat_id: chat,
      },
    });
  }

  leaveChat(chat) {
    return this.request({
      method: 'leaveChat',
      query: {
        chat_id: chat,
      },
    });
  }

  getChat(chat) {
    return this.request({
      method: 'getChat',
      query: {
        chat_id: chat,
      },
    });
  }

  getChatAdministrators(chat) {
    return this.request({
      method: 'getChatAdministrators',
      query: {
        chat_id: chat,
      },
    });
  }

  getChatMembersCount(chat) {
    return this.request({
      method: 'getChatMembersCount',
      query: {
        chat_id: chat,
      },
    });
  }

  getChatMember(params = {}) {
    return this.request({
      method: 'getChatMember',
      query: params,
    });
  }

  setChatStickerSet(params = {}) {
    return this.request({
      method: 'setChatStickerSet',
      query: params,
    });
  }

  deleteChatStickerSet(chat) {
    return this.request({
      method: 'deleteChatStickerSet',
      query: {
        chat_id: chat,
      },
    });
  }

  answerCallbackQuery(params = {}) {
    return this.request({
      method: 'answerCallbackQuery',
      query: params,
    });
  }

  editMessageText(params = {}) {
    return this.request({
      method: 'editMessageText',
      query: params,
    });
  }

  editMessageCaption(params = {}) {
    return this.request({
      method: 'editMessageCaption',
      query: params,
    });
  }

  editMessageMedia(params = {}) {
    return this.request({
      method: 'editMessageMedia',
      query: params,
    });
  }

  editMessageReplyMarkup(params = {}) {
    return this.request({
      method: 'editMessageReplyMarkup',
      query: params,
    });
  }

  stopPoll(params = {}) {
    return this.request({
      method: 'stopPoll',
      query: params,
    });
  }
  
  deleteMessage(params = {}) {
    return this.request({
      method: 'deleteMessage',
      query: params,
    });
  }

  sendSticker(params = {}) {
    return this.request({
      method: 'sendSticker',
      query: params,
    });
  }

  getStickerSet(name) {
    return this.request({
      method: 'getStickerSet',
      query: {
        name,
      },
    });
  }

  uploadStickerFile(params) {
    return this.request({
      method: 'uploadStickerFile',
      query: params,
    });
  }

  createNewStickerSet(params = {}) {
    return this.request({
      method: 'createNewStickerSet',
      query: params,
    });
  }

  addStickerToSet(params = {}) {
    return this.request({
      method: 'addStickerToSet',
      query: params,
    });
  }

  setStickerPositionInSet(params = {}) {
    return this.request({
      method: 'setStickerPositionInSet',
      query: params,
    });
  }

  deleteStickerFromSet(sticker) {
    return this.request({
      method: 'deleteStickerFromSet',
      query: {
        sticker,
      },
    });
  }

  answerInlineQuery(params = {}) {
    return this.request({
      method: 'answerInlineQuery',
      query: params,
    });
  }

  sendInvoice(params = {}) {
    return this.request({
      method: 'sendInvoice',
      query: params,
    });
  }

  answerShippingQuery(params = {}) {
    return this.request({
      method: 'answerShippingQuery',
      query: params,
    });
  }

  answerPreCheckoutQuery(params = {}) {
    return this.request({
      method: 'answerPreCheckoutQuery',
      query: params,
    });
  }

  setPassportDataErrors(params = {}) {
    return this.request({
      method: 'setPassportDataErrors',
      query: params,
    });
  }

  sendGame(params = {}) {
    return this.request({
      method: 'sendGame',
      query: params,
    });
  }

  setGameScore(params = {}) {
    return this.request({
      method: 'setGameScore',
      query: params,
    });
  }

  getGameHighScores(params = {}) {
    return this.request({
      method: 'getGameHighScores',
      query: params,
    });
  }

  setWebhook(params = {}) {
    return this.request({
      method: 'setWebhook',
      query: params,
    });
  }

  deleteWebhook() {
    return this.request({
      method: 'deleteWebhook',
    });
  }

  getWebhookInfo() {
    return this.request({
      method: 'getWebhookInfo',
    });
  }
}

module.exports = API;
