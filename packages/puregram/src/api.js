let fetch = require('node-fetch');
let FormData = require('form-data');
let { Readable } = require('stream');
let fs = require('fs');

let APIError = require('./attachments/apierror');

class API {
  constructor(telegram) {
    this.telegram = telegram;
    this.baseApiUrl = this.telegram.baseApiUrl;
    this.agent = this.telegram.agent;
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
    type = 'query',
    method,
    query,
  }) {
    let url = `${this.baseApiUrl}/${method}`;

    if (query) {
      if ('reply_markup' in query) {
        query.reply_markup = typeof query.reply_markup === 'string'
          ? query.reply_markup
          : query.reply_markup.toJSON();
      }

      if (type === 'url') {
        url += '?';

        for (let [key, value] of Object.entries(query)) {
          url += `${key}=${
            encodeURI(
              method === 'sendPoll' && Array.isArray(value)
                ? JSON.stringify(value)
                : value.toString()
            )
          }&`;
        }
      }
    }

    let headers = {
      'Content-Type': 'application/json'
    };

    if (method === 'getUpdates') {
      headers.connection = 'keep-alive';
    }

    let body = null;

    if (query instanceof FormData) {
      body = query;
    } else if (type === 'query') {
      body = JSON.stringify(query);
    }

    let response = null;

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: body instanceof FormData ? null : headers,
        body,
        agent: this.agent
      });
    } catch (e) {
      throw e;
    }

    let json = await response.json();

    if (!json.ok) {
      throw new APIError(json.description);
    }

    return json.result;
  }

  getMe() {
    return this.request({
      method: 'getMe',
    });
  }

  getUpdates(params = {}) {
    return this.request({
      type: 'url',
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
    let { photo } = params;

    return getResponse(photo, {
      method: 'sendPhoto',
      key: 'photo',
      params,
      telegram: this.telegram
    });
  }

  sendAudio(params = {}) {
    let { audio } = params;

    return getResponse(audio, {
      method: 'sendAudio',
      key: 'audio',
      params,
      telegram: this.telegram
    });
  }

  sendDocument(params = {}) {
    let { document } = params;

    return getResponse(document, {
      method: 'sendDocument',
      key: 'document',
      params,
      telegram: this.telegram
    });
  }

  sendVideo(params = {}) {
    let { video } = params;

    return getResponse(video, {
      method: 'sendVideo',
      key: 'video',
      params,
      telegram: this.telegram
    });
  }

  sendAnimation(params = {}) {
    let { animation } = params;

    return getResponse(animation, {
      method: 'sendAnimation',
      key: 'animation',
      params,
      telegram: this.telegram
    });
  }

  sendVoice(params = {}) {
    let { voice } = params;

    return getResponse(voice, {
      method: 'sendVoice',
      key: 'voice',
      params,
      telegram: this.telegram
    });
  }

  sendVideoNote(params = {}) {
    let { videoNote } = params;

    return getResponse(videoNote, {
      method: 'sendVideoNote',
      key: 'videonote',
      params,
      telegram: this.telegram
    });
  }

  sendMediaGroup(params = {}) {
    let { media } = params;

    return getResponse(media, {
      method: 'sendMediaGroup',
      key: 'media',
      params,
      telegram: this.telegram
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

  async getUserProfilePhotos(params = {}) {
    return this.request({
      method: 'getUserProfilePhotos',
      query: params,
    });
  }

  getFile(id) {
    return this.request({
      method: 'getFile',
      query: { file_id: id },
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

  exportChatInviteLink(chat) {
    return this.request({
      method: 'exportChatInviteLink',
      query: {
        chat_id: chat
      },
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
      query: { name },
    });
  }

  uploadStickerFile(params = {}) {
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

  setStickerSetThumb(params = {}) {
    return this.request({
      method: 'setStickerSetThumb',
      query: params
    })
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

  setChatAdministratorCustomTitle(params = {}) {
    return this.request({
      method: 'setChatAdministratorCustomTitle',
      query: params,
    })
  }

  sendDice(params = {}) {
    return this.request({
      method: 'sendDice',
      query: params
    })
  }

  getMyCommands() {
    return this.request({
      method: 'getMyCommands'
    })
  }

  setMyCommands(commands) {
    return this.request({
      method: 'setMyCommands',
      query: { commands }
    })
  }
}

async function getResponse(value, { method, key, params, telegram }) {
  let response = null;
  let form = null;
  let isPath = fs.existsSync(value);

  if (value instanceof Readable) {
    form = new FormData();

    form.append(key, value);
  } else if (Buffer.isBuffer(value)) {
    form = new FormData();

    form.append(key, value, { filename: key + this.chatId });
  } else if (typeof value === 'string' && !value.startsWith('http') && isPath) {
    form = new FormData();

    let stream = fs.createReadStream(value);
    form.append(key, stream);
  }

  if (form && key in params) {
    // eslint-disable-next-line no-unused-vars
    let { [key]: _, ...tempParams } = params;

    params = tempParams;
  }

  if (form) {
    for (let [fKey, fValue] of Object.entries(params)) {
      let afValue = fValue;

      if (typeof fValue === 'boolean') {
        afValue = JSON.stringify(fValue);
      }

      // Is keyboard
      if (fValue.toJSON) {
        afValue = fValue.toJSON();
      }

      form.append(fKey, afValue);
    }

    response = await telegram.api.request({
      method,
      query: form
    });
  } else {
    response = await telegram.api.request({
      method,
      query: params
    });
  }

  return response;
}

module.exports = API;
