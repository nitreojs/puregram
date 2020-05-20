import Params from '../typings/params';
import Interfaces from '../typings/interfaces';
import Telegram from './telegram';

type MessageOrTrue = object | true;

declare class API {
  constructor(telegram: Telegram);

  call(method: string, params: object): Promise<object>;

  /**
   * A simple method for testing your bot's auth token.
   *
   * Returns basic information about the bot in form of a `User` object.
   */
  getMe(): Promise<object>;

  /**
   * Use this method to receive incoming updates using long polling.
   *
   * An Array of `Update` objects is returned.
   */
  getUpdates(params?: Params.IGetUpdatesParams): Promise<object>;

  /**
   * Use this method to send text messages.
   *
   * On success, the sent `Message` is returned.
   */
  sendMessage(params?: Params.ISendMessageParams): Promise<object>;

  /**
   * Use this method to forward messages of any kind.
   *
   * On success, the sent `Message` is returned.
   */
  forwardMessage(params?: Params.IForwardMessageParams): Promise<object>;

  /**
   * Use this method to send photos.
   *
   * On success, the sent `Message` is returned.
   */
  sendPhoto(params?: Params.ISendPhotoParams): Promise<object>;

  /**
   * Use this method to send audio files,
   * if you want Telegram clients to display them in the music player.
   * Your audio must be in the .MP3 or .M4A format.
   *
   * On success, the sent `Message` is returned.
   *
   * Bots can currently send audio files of up to 50 MB in size,
   * this limit may be changed in the future.
   *
   * For sending voice messages, use the `sendVoice` method instead.
   */
  sendAudio(params?: Params.ISendAudioParams): Promise<object>;

  /**
   * Use this method to send general files.
   *
   * On success, the sent `Message` is returned.
   *
   * Bots can currently send files of any type of up to 50 MB in size,
   * this limit may be changed in the future.
   */
  sendDocument(params?: Params.ISendDocumentParams): Promise<object>;

  /**
   * Use this method to send video files,
   * Telegram clients support mp4 videos
   * (other formats may be sent as `Document`).
   *
   * On success, the sent `Message` is returned.
   *
   * Bots can currently send video files of up to 50 MB in size,
   * this limit may be changed in the future.
   */
  sendVideo(params?: Params.ISendVideoParams): Promise<object>;

  /**
   * Use this method to send animation files
   * (GIF or H.264/MPEG-4 AVC video without sound).
   *
   * On success, the sent `Message` is returned.
   *
   * Bots can currently send animation files of up to 50 MB in size,
   * this limit may be changed in the future.
   */
  sendAnimation(params?: Params.ISendAnimationParams): Promise<object>;

  /**
   * Use this method to send audio files,
   * if you want Telegram clients to display the file as a playable voice message.
   * For this to work, your audio must be in an .OGG file encoded with OPUS
   * (other formats may be sent as `Audio` or `Document`).
   *
   * On success, the sent `Message` is returned.
   *
   * Bots can currently send voice messages of up to 50 MB in size,
   * this limit may be changed in the future.
   */
  sendVoice(params?: Params.ISendVoiceParams): Promise<object>;

  /**
   * As of v.4.0, Telegram clients support rounded square mp4 videos
   * of up to 1 minute long.
   * Use this method to send video messages.
   *
   * On success, the sent `Message` is returned.
   */
  sendVideoNote(params?: Params.ISendVideoNoteParams): Promise<object>;

  /**
   * Use this method to send a group of photos or videos as an album.
   *
   * On success, an `Array<Message>` is returned.
   */
  sendMediaGroup(params?: Params.ISendMediaGroupParams): Promise<Array<object>>;

  /**
   * Use this method to send point on the map.
   *
   * On success, the sent `Message` is returned.
   */
  sendLocation(params?: Params.ISendLocationParams): Promise<object>;

  /**
   * Use this method to edit live location messages.
   * A location can be edited until its live_period expires
   * or editing is explicitly disabled by a call to `stopMessageLiveLocation`.
   *
   * On success, if the edited message was sent by the bot,
   * the edited `Message` is returned, otherwise `True` is returned.
   */
  editMessageLiveLocation(params?: Params.IEditMessageLiveLocationParams): Promise<MessageOrTrue>;

  /**
   * Use this method to stop updating a live location message
   * before live_period expires.
   *
   * On success, if the message was sent by the bot,
   * the sent `Message` is returned, otherwise `True` is returned.
   */
  stopMessageLiveLocation(params?: Params.IStopMessageLiveLocationParams): Promise<MessageOrTrue>;

  /**
   * Use this method to send information about a venue.
   *
   * On success, the sent `Message` is returned.
   */
  sendVenue(params?: Params.ISendVenueParams): Promise<object>;

  /**
   * Use this method to send phone contacts.
   *
   * On success, the sent `Message` is returned.
   */
  sendContact(params?: Params.ISendContactParams): Promise<object>;

  /**
   * Use this method to send a native poll.
   *
   * On success, the sent `Message` is returned.
   */
  sendPoll(params?: Params.ISendPollParams): Promise<object>;

  /**
   * Use this method to send a dice, which will have a random value from `1` to `6`.
   *
   * On success, the sent `Message` is returned.
   */
  sendDice(params?: Params.ISendDiceParams): Promise<object>;

  /**
   * Use this method when you need to tell the user that
   * something is happening on the bot's side.
   * The status is set for 5 seconds or less
   * (when a message arrives from your bot,
   * Telegram clients clear its typing status).
   *
   * Returns `True` on success.
   */
  sendChatAction(params?: Params.ISendChatActionParams): Promise<true>;

  /**
   * Use this method to get a list of profile pictures for a user.
   *
   * Returns a `UserProfilePhotos` object.
   */
  getUserProfilePhotos(params?: Params.IGetUserProfilePhotosParams): Promise<object>;

  /**
   * Use this method to get basic info about a file and
   * prepare it for downloading.
   * For the moment, bots can download files of up to 20MB in size.
   *
   * On success, a `File` object is returned.
   */
  getFile(id: string): Promise<object>;

  /**
   * Use this method to kick a user from a group, a supergroup or a channel.
   * In the case of supergroups and channels,
   * the user will not be able to return to the group
   * on their own using invite links, etc., unless unbanned first.
   * The bot must be an administrator in the chat for this to work
   * and must have the appropriate admin rights.
   *
   * Returns `True` on success.
   */
  kickChatMember(params?: Params.IKickChatMemberParams): Promise<true>;

  /**
   * Use this method to unban a previously kicked user in a supergroup or channel.
   * The user will not return to the group or channel automatically,
   * but will be able to join via link, etc.
   * The bot must be an administrator for this to work.
   *
   * Returns `True` on success.
   */
  unbanChatMember(params?: Params.IUnbanChatMemberParams): Promise<true>;

  /**
   * Use this method to restrict a user in a supergroup.
   * The bot must be an administrator in the supergroup
   * for this to work and must have the appropriate admin rights.
   * Pass `True` for all permissions to lift restrictions from a user.
   *
   * Returns `True` on success.
   */
  restrictChatMember(params?: Params.IRestrictChatMemberParams): Promise<true>;

  /**
   * Use this method to promote or demote a user in a supergroup or a channel.
   * The bot must be an administrator in the chat for this to work
   * and must have the appropriate admin rights.
   * Pass `False` for all boolean parameters to demote a user.
   *
   * Returns `True` on success.
   */
  promoteChatMember(params?: Params.IPromoteChatMemberParams): Promise<true>;

  /**
   * Use this method to set a custom title for an administrator
   * in a supergroup promoted by the bot.
   *
   * Returns `True` on success.
   */
  setChatAdministratorCustomTitle(params?: Params.ISetChatAdministratorCustomTitleParams): Promise<true>;

  /**
   * Use this method to set default chat permissions for all members.
   * The bot must be an administrator in the group or a supergroup
   * for this to work and must have the `can_restrict_members` admin rights.
   *
   * Returns `True` on success.
   */
  setChatPermissions(params?: Params.ISetChatPermissionsParams): Promise<true>;

  /**
   * Use this method to generate a new invite link for a chat;
   * any previously generated link is revoked.
   * The bot must be an administrator in the chat for this
   * to work and must have the appropriate admin rights.
   *
   * Returns the new invite link as `String` on success.
   */
  exportChatInviteLink(chat: number | string): Promise<string>;

  /**
   * Use this method to set a new profile photo for the chat.
   * Photos can't be changed for private chats.
   * The bot must be an administrator in the chat for this
   * to work and must have the appropriate admin rights.
   *
   * Returns `True` on success.
   */
  setChatPhoto(params?: Params.ISetChatPhotoParams): Promise<true>;

  /**
   * Use this method to delete a chat photo.
   * Photos can't be changed for private chats.
   * The bot must be an administrator in the chat for this
   * to work and must have the appropriate admin rights.
   *
   * Returns `True` on success.
   */
  deleteChatPhoto(chat: number | string): Promise<true>;

  /**
   * Use this method to change the title of a chat.
   * Titles can't be changed for private chats.
   * The bot must be an administrator in the chat for this
   * to work and must have the appropriate admin rights.
   *
   * Returns `True` on success.
   */
  setChatTitle(params?: Params.ISetChatTitleParams): Promise<true>;

  /**
   * Use this method to change the description of a group, a supergroup or a channel.
   * The bot must be an administrator in the chat for this
   * to work and must have the appropriate admin rights.
   *
   * Returns `True` on success.
   */
  setChatDescription(params?: Params.ISetChatDescriptionParams): Promise<true>;

  /**
   * Use this method to pin a message in a group, a supergroup, or a channel.
   * The bot must be an administrator in the chat for this
   * to work and must have the `can_pin_messages` admin right
   * in the supergroup or `can_edit_messages` admin right in the channel.
   *
   * Returns `True` on success.
   */
  pinChatMessage(params?: Params.IPinChatMessageParams): Promise<true>;

  /**
   * Use this method to unpin a message in a group, a supergroup, or a channel.
   * The bot must be an administrator in the chat for this
   * to work and must have the `can_pin_messages` admin right
   * in the supergroup or `can_edit_messages` admin right in the channel.
   *
   * Returns `True` on success.
   */
  unpinChatMessage(chat: number | string): Promise<true>;

  /**
   * Use this method for your bot to leave a group, supergroup or channel.
   *
   * Returns `True` on success.
   */
  leaveChat(chat: number | string): Promise<true>;

  /**
   * Use this method to get up to date information about the chat
   * (current name of the user for one-on-one conversations,
   * current username of a user, group or channel, etc.).
   *
   * Returns a `Chat` object on success.
   */
  getChat(chat: number | string): Promise<object>;

  /**
   * Use this method to get a list of administrators in a chat.
   *
   * On success, returns an `Array<ChatMember>`
   * that contains information about all chat administrators except other bots.
   *
   * If the chat is a group or a supergroup and no administrators were appointed,
   * only the creator will be returned.
   */
  getChatAdministrators(chat: number | string): Promise<object>;

  /**
   * Use this method to get the number of members in a chat.
   *
   * Returns `Integer` on success.
   */
  getChatMembersCount(chat: number | string): Promise<number>;

  /**
   * Use this method to get information about a member of a chat.
   *
   * Returns a `ChatMember` object on success.
   */
  getChatMember(params?: Params.IGetChatMemberParams): Promise<object>;

  /**
   * Use this method to set a new group sticker set for a supergroup.
   * The bot must be an administrator in the chat for this
   * to work and must have the appropriate admin rights.
   * Use the field `can_set_sticker_set` optionally returned in
   * `getChat` requests to check if the bot can use this method.
   *
   * Returns `True` on success.
   */
  setChatStickerSet(params?: Params.ISetChatStickerSetParams): Promise<true>;

  /**
   * Use this method to delete a group sticker set from a supergroup.
   * The bot must be an administrator in the chat for this
   * to work and must have the appropriate admin rights.
   * Use the field `can_set_sticker_set` optionally returned in
   * `getChat` requests to check if the bot can use this method.
   *
   * Returns `True` on success.
   */
  deleteChatStickerSet(chat: number | string): Promise<true>;

  /**
   * Use this method to send answers to callback queries
   * sent from inline keyboards.
   * The answer will be displayed to the user as a notification
   * at the top of the chat screen or as an alert.
   *
   * On success, `True` is returned.
   */
  answerCallbackQuery(params?: Params.IAnswerCallbackQueryParams): Promise<true>;

  /**
   * Use this method to change the list of the bot's commands.
   *
   * Returns `True` on success.
   */
  setMyCommands(commands: Array<Interfaces.IBotCommand>): Promise<true>;

  /**
   * Use this method to get the current list of the bot's commands.
   *
   * Returns `Array<BotCommand>` on success.
   */
  getMyCommands(): Promise<object>;

  /**
   * Use this method to edit text and game messages.
   *
   * On success, if edited message is sent by the bot,
   * the edited `Message` is returned,
   * otherwise `True` is returned.
   */
  editMessageText(params?: Params.IEditMessageTextParams): Promise<MessageOrTrue>;

  /**
   * Use this method to edit captions of messages.
   *
   * On success, if edited message is sent by the bot,
   * the edited `Message` is returned,
   * otherwise `True` is returned.
   */
  editMessageCaption(params?: Params.IEditMessageCaptionParams): Promise<MessageOrTrue>;

  /**
   * Use this method to edit animation, audio, document,
   * photo, or video messages.
   * If a message is a part of a message album,
   * then it can be edited only to a photo or a video.
   * Otherwise, message type can be changed arbitrarily.
   * When inline message is edited, new file can't be uploaded.
   * Use previously uploaded file via its `file_id` or specify a `URL`.
   *
   * On success, if the edited message was sent by the bot,
   * the edited `Message` is returned,
   * otherwise `True` is returned.
   */
  editMessageMedia(params?: Params.IEditMessageMediaParams): Promise<MessageOrTrue>;

  /**
   * Use this method to edit only the reply markup of messages.
   *
   * On success, if edited message is sent by the bot,
   * the edited `Message` is returned,
   * otherwise `True` is returned.
   */
  editMessageReplyMarkup(params?: Params.IEditMessageReplyMarkupParams): Promise<MessageOrTrue>;

  /**
   * Use this method to stop a poll which was sent by the bot.
   *
   * On success, the stopped `Poll` with the final results is returned.
   */
  stopPoll(params?: Params.IStopPollParams): Promise<object>;

  /**
   * Use this method to delete a message, including service messages, with the following limitations:
   * - A message can only be deleted if it was sent less than 48 hours ago.
   * - Bots can delete outgoing messages in private chats, groups, and supergroups.
   * - Bots can delete incoming messages in private chats.
   * - Bots granted can_post_messages permissions can delete outgoing messages in channels.
   * - If the bot is an administrator of a group, it can delete any message there.
   * - If the bot has can_delete_messages permission in a supergroup or a channel, it can delete any message there.
   *
   * Returns `True` on success.
   */
  deleteMessage(params?: Params.IDeleteMessageParams): Promise<true>;

  /**
   * Use this method to send static .WEBP or animated .TGS stickers.
   *
   * On success, the sent `Message` is returned.
   */
  sendSticker(params?: Parms.ISendStickerParams): Promise<object>;

  /**
   * Use this method to get a sticker set.
   *
   * On success, a `StickerSet` object is returned.
   */
  getStickerSet(name: string): Promise<object>;

  /**
   * Use this method to upload a .PNG file with a sticker for later use
   * in `createNewStickerSet` and `addStickerToSet` methods
   * (can be used multiple times).
   *
   * Returns the uploaded `File` on success.
   */
  uploadStickerFile(params?: Params.IUploadStickerFileParams): Promise<object>;

  /**
   * Use this method to create a new sticker set owned by a user.
   * The bot will be able to edit the sticker set thus created.
   * You must use exactly one of the fields `png_sticker` or `tgs_sticker`.
   *
   * Returns `True` on success.
   */
  createNewStickerSet(params?: Params.ICreateNewStickerSetParams): Promise<true>;

  /**
   * Use this method to add a new sticker to a set created by the bot.
   * You must use exactly one of the fields `png_sticker` or `tgs_sticker`.
   * Animated stickers can be added to animated sticker sets and only to them.
   * Animated sticker sets can have up to 50 stickers.
   * Static sticker sets can have up to 120 stickers.
   *
   * Returns `True` on success.
   */
  addStickerToSet(params?: Params.IAddStickerToSetParams): Promise<true>;

  /**
   * Use this method to move a sticker in a set created by the bot to a specific position.
   *
   * Returns `True` on success.
   */
  setStickerPositionInSet(params?: Params.ISetStickerPositionInSetParams): Promise<true>;

  /**
   * Use this method to delete a sticker from a set created by the bot.
   *
   * Returns `True` on success.
   */
  deleteStickerFromSet(sticker: string): Promise<true>;

  /**
   * Use this method to set the thumbnail of a sticker set.
   * Animated thumbnails can be set for animated sticker sets only.
   *
   * Returns `True` on success.
   */
  setStickerSetThumb(params?: Params.ISetStickerSetThumbParams): Promise<true>;

  /**
   * Use this method to send answers to an inline query.
   *
   * On success, `True` is returned.
   *
   * No more than **50** results per query are allowed.
   */
  answerInlineQuery(params?: Params.IAnswerInlineQueryParams): Promise<true>;

  /**
   * Use this method to send invoices.
   *
   * On success, the sent `Message` is returned.
   */
  sendInvoice(params?: Params.ISendInvoiceParams): Promise<object>;

  /**
   * If you sent an invoice requesting a shipping address
   * and the parameter `is_flexible` was specified,
   * the Bot API will send an Update with a `shipping_query` field to the bot.
   * Use this method to reply to shipping queries.
   *
   * On success, `True` is returned.
   */
  answerShippingQuery(params?: Params.AnswerShippingQueryParams): Promise<true>;

  /**
   * Once the user has confirmed their payment and shipping details,
   * the Bot API sends the final confirmation in the form of an `Update`
   * with the field `pre_checkout_query`.
   * Use this method to respond to such pre-checkout queries.
   *
   * *puregram creator's note*: Bot API will trigger the `pre_checkout_query`
   * event and you need to handle it within 10 seconds using
   * `telegram.updates.on('pre_checkout_query', handler)`.
   *
   * On success, `True` is returned.
   *
   * **Note**: The Bot API must receive an answer within 10 seconds
   * after the pre-checkout query was sent.
   */
  answerPreCheckoutQuery(params?: Params.AnswerPreCheckoutQueryParams): Promise<true>;

  /**
   * Informs a user that some of the Telegram Passport elements
   * they provided contains errors.
   * The user will not be able to re-submit their Passport to you
   * until the errors are fixed
   * (the contents of the field for which you returned the error must change).
   *
   * Returns `True` on success.
   *
   * Use this if the data submitted by the user doesn't satisfy the standards
   * your service requires for any reason.
   * For example, if a birthday date seems invalid,
   * a submitted document is blurry, a scan shows evidence of tampering, etc.
   * Supply some details in the error message to make sure the user knows
   * how to correct the issues.
   */
  setPassportDataErrors(params?: Params.ISetPassportDataErrorsParams): Promise<true>;

  /**
   * Use this method to send a game.
   *
   * On success, the sent `Message` is returned.
   */
  sendGame(params?: Params.ISendGameParams): Promise<object>;

  /**
   * Use this method to set the score of the specified user in a game.
   *
   * On success, if the message was sent by the bot,
   * returns the edited `Message`,
   * otherwise returns `True`.
   *
   * Returns an error, if the new score is not greater than the user's current score
   * in the chat and force is `False`.
   */
  setGameScore(params?: Params.ISetGameScoreParams): Promise<MessageOrTrue>;

  /**
   * Use this method to get data for high score tables.
   * Will return the score of the specified user and several
   * of his neighbors in a game.
   *
   * On success, returns an `Array<GameHighScore>` objects.
   */
  getGameHighScores(params?: Params.IGetGameHighScoresParams): Promise<object>;

  /**
   * Use this method to specify a url and receive incoming updates
   * via an outgoing webhook.
   * Whenever there is an update for the bot, we will send an HTTPS POST
   * request to the specified url, containing a JSON-serialized `Update`.
   * In case of an unsuccessful request, we will give up after a reasonable
   * amount of attempts.
   *
   * Returns `True` on success.
   *
   * If you'd like to make sure that the Webhook request comes from Telegram,
   * we recommend using a secret path in the URL,
   * e.g. `https://www.example.com/<token>`
   *
   * *Since nobody else knows your bot‘s token, you can be pretty sure it’s us*.
   */
  setWebhook(params?: Params.ISetWebhookParams): Promise<true>;

  /**
   * Use this method to remove webhook integration if you decide
   * to switch back to `getUpdates`.
   *
   * Returns `True` on success.
   */
  deleteWebhook(): Promise<true>;

  /**
   * Use this method to get current webhook status.
   *
   * On success, returns a `WebhookInfo` object.
   *
   * If the bot is using `getUpdates`,
   * will return an object with the `url` field empty.
   */
  getWebhookInfo(): Promise<object>;
}

export = API;
