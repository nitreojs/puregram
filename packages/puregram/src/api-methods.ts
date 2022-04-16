/// AUTO-GENERATED FILE
/// DO NOT EDIT MANUALLY
///
/// This file was auto-generated using https://github.com/ark0f/tg-bot-api
/// Based on Bot API v6.0.0, 16.04.2022
/// Generation date: 16.04.2022 18:19:03 MSK

import * as api from './methods';

export interface ApiMethods {
  /**
   * Use this method to receive incoming updates using long polling ([wiki](https://en.wikipedia.org/wiki/Push_technology#Long_polling)). An Array of [Update](https://core.telegram.org/bots/api/#update) objects is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#getupdates)
   */
  getUpdates: api.getUpdates;
  /**
   * Use this method to specify a url and receive incoming updates via an outgoing webhook. Whenever there is an update for the bot, we will send an HTTPS POST request to the specified url, containing a JSON-serialized [Update](https://core.telegram.org/bots/api/#update). In case of an unsuccessful request, we will give up after a reasonable amount of attempts. Returns *True* on success.
   * 
   * If you'd like to make sure that the Webhook request comes from Telegram, we recommend using a secret path in the URL, e.g. `https://www.example.com/<token>`. Since nobody else knows your bot's token, you can be pretty sure it's us.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#setwebhook)
   */
  setWebhook: api.setWebhook;
  /**
   * Use this method to remove webhook integration if you decide to switch back to [getUpdates](https://core.telegram.org/bots/api/#getupdates). Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#deletewebhook)
   */
  deleteWebhook: api.deleteWebhook;
  /**
   * Use this method to get current webhook status. Requires no parameters. On success, returns a [WebhookInfo](https://core.telegram.org/bots/api/#webhookinfo) object. If the bot is using [getUpdates](https://core.telegram.org/bots/api/#getupdates), will return an object with the *url* field empty.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#getwebhookinfo)
   */
  getWebhookInfo: api.getWebhookInfo;
  /**
   * A simple method for testing your bot's authentication token. Requires no parameters. Returns basic information about the bot in form of a [User](https://core.telegram.org/bots/api/#user) object.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#getme)
   */
  getMe: api.getMe;
  /**
   * Use this method to log out from the cloud Bot API server before launching the bot locally. You **must** log out the bot before running it locally, otherwise there is no guarantee that the bot will receive updates. After a successful call, you can immediately log in on a local server, but will not be able to log in back to the cloud Bot API server for 10 minutes. Returns *True* on success. Requires no parameters.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#logout)
   */
  logOut: api.logOut;
  /**
   * Use this method to close the bot instance before moving it from one local server to another. You need to delete the webhook before calling this method to ensure that the bot isn't launched again after server restart. The method will return error 429 in the first 10 minutes after the bot is launched. Returns *True* on success. Requires no parameters.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#close)
   */
  close: api.close;
  /**
   * Use this method to send text messages. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#sendmessage)
   */
  sendMessage: api.sendMessage;
  /**
   * Use this method to forward messages of any kind. Service messages can't be forwarded. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#forwardmessage)
   */
  forwardMessage: api.forwardMessage;
  /**
   * Use this method to copy messages of any kind. Service messages and invoice messages can't be copied. The method is analogous to the method [forwardMessage](https://core.telegram.org/bots/api/#forwardmessage), but the copied message doesn't have a link to the original message. Returns the [MessageId](https://core.telegram.org/bots/api/#messageid) of the sent message on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#copymessage)
   */
  copyMessage: api.copyMessage;
  /**
   * Use this method to send photos. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#sendphoto)
   */
  sendPhoto: api.sendPhoto;
  /**
   * Use this method to send audio files, if you want Telegram clients to display them in the music player. Your audio must be in the .MP3 or .M4A format. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned. Bots can currently send audio files of up to 50 MB in size, this limit may be changed in the future.
   * 
   * For sending voice messages, use the [sendVoice](https://core.telegram.org/bots/api/#sendvoice) method instead.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#sendaudio)
   */
  sendAudio: api.sendAudio;
  /**
   * Use this method to send general files. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned. Bots can currently send files of any type of up to 50 MB in size, this limit may be changed in the future.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#senddocument)
   */
  sendDocument: api.sendDocument;
  /**
   * Use this method to send video files, Telegram clients support mp4 videos (other formats may be sent as [Document](https://core.telegram.org/bots/api/#document)). On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned. Bots can currently send video files of up to 50 MB in size, this limit may be changed in the future.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#sendvideo)
   */
  sendVideo: api.sendVideo;
  /**
   * Use this method to send animation files (GIF or H.264/MPEG-4 AVC video without sound). On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned. Bots can currently send animation files of up to 50 MB in size, this limit may be changed in the future.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#sendanimation)
   */
  sendAnimation: api.sendAnimation;
  /**
   * Use this method to send audio files, if you want Telegram clients to display the file as a playable voice message. For this to work, your audio must be in an .OGG file encoded with OPUS (other formats may be sent as [Audio](https://core.telegram.org/bots/api/#audio) or [Document](https://core.telegram.org/bots/api/#document)). On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned. Bots can currently send voice messages of up to 50 MB in size, this limit may be changed in the future.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#sendvoice)
   */
  sendVoice: api.sendVoice;
  /**
   * As of [v.4.0](https://telegram.org/blog/video-messages-and-telescope), Telegram clients support rounded square mp4 videos of up to 1 minute long. Use this method to send video messages. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#sendvideonote)
   */
  sendVideoNote: api.sendVideoNote;
  /**
   * Use this method to send a group of photos, videos, documents or audios as an album. Documents and audio files can be only grouped in an album with messages of the same type. On success, an array of [Messages](https://core.telegram.org/bots/api/#message) that were sent is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#sendmediagroup)
   */
  sendMediaGroup: api.sendMediaGroup;
  /**
   * Use this method to send point on the map. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#sendlocation)
   */
  sendLocation: api.sendLocation;
  /**
   * Use this method to edit live location messages. A location can be edited until its *live\_period* expires or editing is explicitly disabled by a call to [stopMessageLiveLocation](https://core.telegram.org/bots/api/#stopmessagelivelocation). On success, if the edited message is not an inline message, the edited [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#editmessagelivelocation)
   */
  editMessageLiveLocation: api.editMessageLiveLocation;
  /**
   * Use this method to stop updating a live location message before *live\_period* expires. On success, if the message is not an inline message, the edited [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#stopmessagelivelocation)
   */
  stopMessageLiveLocation: api.stopMessageLiveLocation;
  /**
   * Use this method to send information about a venue. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#sendvenue)
   */
  sendVenue: api.sendVenue;
  /**
   * Use this method to send phone contacts. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#sendcontact)
   */
  sendContact: api.sendContact;
  /**
   * Use this method to send a native poll. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#sendpoll)
   */
  sendPoll: api.sendPoll;
  /**
   * Use this method to send an animated emoji that will display a random value. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#senddice)
   */
  sendDice: api.sendDice;
  /**
   * Use this method when you need to tell the user that something is happening on the bot's side. The status is set for 5 seconds or less (when a message arrives from your bot, Telegram clients clear its typing status). Returns *True* on success.
   * 
   * Example: The [ImageBot](https://t.me/imagebot) needs some time to process a request and upload the image. Instead of sending a text message along the lines of “Retrieving image, please wait…”, the bot may use [sendChatAction](https://core.telegram.org/bots/api/#sendchataction) with *action* = *upload\_photo*. The user will see a “sending photo” status for the bot.
   * 
   * We only recommend using this method when a response from the bot will take a **noticeable** amount of time to arrive.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#sendchataction)
   */
  sendChatAction: api.sendChatAction;
  /**
   * Use this method to get a list of profile pictures for a user. Returns a [UserProfilePhotos](https://core.telegram.org/bots/api/#userprofilephotos) object.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#getuserprofilephotos)
   */
  getUserProfilePhotos: api.getUserProfilePhotos;
  /**
   * Use this method to get basic info about a file and prepare it for downloading. For the moment, bots can download files of up to 20MB in size. On success, a [File](https://core.telegram.org/bots/api/#file) object is returned. The file can then be downloaded via the link `https://api.telegram.org/file/bot<token>/<file_path>`, where `<file_path>` is taken from the response. It is guaranteed that the link will be valid for at least 1 hour. When the link expires, a new one can be requested by calling [getFile](https://core.telegram.org/bots/api/#getfile) again.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#getfile)
   */
  getFile: api.getFile;
  /**
   * Use this method to ban a user in a group, a supergroup or a channel. In the case of supergroups and channels, the user will not be able to return to the chat on their own using invite links, etc., unless [unbanned](https://core.telegram.org/bots/api/#unbanchatmember) first. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#banchatmember)
   */
  banChatMember: api.banChatMember;
  /**
   * Use this method to unban a previously banned user in a supergroup or channel. The user will **not** return to the group or channel automatically, but will be able to join via link, etc. The bot must be an administrator for this to work. By default, this method guarantees that after the call the user is not a member of the chat, but will be able to join it. So if the user is a member of the chat they will also be **removed** from the chat. If you don't want this, use the parameter *only\_if\_banned*. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#unbanchatmember)
   */
  unbanChatMember: api.unbanChatMember;
  /**
   * Use this method to restrict a user in a supergroup. The bot must be an administrator in the supergroup for this to work and must have the appropriate administrator rights. Pass *True* for all permissions to lift restrictions from a user. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#restrictchatmember)
   */
  restrictChatMember: api.restrictChatMember;
  /**
   * Use this method to promote or demote a user in a supergroup or a channel. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Pass *False* for all boolean parameters to demote a user. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#promotechatmember)
   */
  promoteChatMember: api.promoteChatMember;
  /**
   * Use this method to set a custom title for an administrator in a supergroup promoted by the bot. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#setchatadministratorcustomtitle)
   */
  setChatAdministratorCustomTitle: api.setChatAdministratorCustomTitle;
  /**
   * Use this method to ban a channel chat in a supergroup or a channel. Until the chat is [unbanned](https://core.telegram.org/bots/api/#unbanchatsenderchat), the owner of the banned chat won't be able to send messages on behalf of **any of their channels**. The bot must be an administrator in the supergroup or channel for this to work and must have the appropriate administrator rights. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#banchatsenderchat)
   */
  banChatSenderChat: api.banChatSenderChat;
  /**
   * Use this method to unban a previously banned channel chat in a supergroup or channel. The bot must be an administrator for this to work and must have the appropriate administrator rights. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#unbanchatsenderchat)
   */
  unbanChatSenderChat: api.unbanChatSenderChat;
  /**
   * Use this method to set default chat permissions for all members. The bot must be an administrator in the group or a supergroup for this to work and must have the *can\_restrict\_members* administrator rights. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#setchatpermissions)
   */
  setChatPermissions: api.setChatPermissions;
  /**
   * Use this method to generate a new primary invite link for a chat; any previously generated primary link is revoked. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns the new invite link as *String* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#exportchatinvitelink)
   */
  exportChatInviteLink: api.exportChatInviteLink;
  /**
   * Use this method to create an additional invite link for a chat. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. The link can be revoked using the method [revokeChatInviteLink](https://core.telegram.org/bots/api/#revokechatinvitelink). Returns the new invite link as [ChatInviteLink](https://core.telegram.org/bots/api/#chatinvitelink) object.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#createchatinvitelink)
   */
  createChatInviteLink: api.createChatInviteLink;
  /**
   * Use this method to edit a non-primary invite link created by the bot. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns the edited invite link as a [ChatInviteLink](https://core.telegram.org/bots/api/#chatinvitelink) object.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#editchatinvitelink)
   */
  editChatInviteLink: api.editChatInviteLink;
  /**
   * Use this method to revoke an invite link created by the bot. If the primary link is revoked, a new link is automatically generated. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns the revoked invite link as [ChatInviteLink](https://core.telegram.org/bots/api/#chatinvitelink) object.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#revokechatinvitelink)
   */
  revokeChatInviteLink: api.revokeChatInviteLink;
  /**
   * Use this method to approve a chat join request. The bot must be an administrator in the chat for this to work and must have the *can\_invite\_users* administrator right. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#approvechatjoinrequest)
   */
  approveChatJoinRequest: api.approveChatJoinRequest;
  /**
   * Use this method to decline a chat join request. The bot must be an administrator in the chat for this to work and must have the *can\_invite\_users* administrator right. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#declinechatjoinrequest)
   */
  declineChatJoinRequest: api.declineChatJoinRequest;
  /**
   * Use this method to set a new profile photo for the chat. Photos can't be changed for private chats. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#setchatphoto)
   */
  setChatPhoto: api.setChatPhoto;
  /**
   * Use this method to delete a chat photo. Photos can't be changed for private chats. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#deletechatphoto)
   */
  deleteChatPhoto: api.deleteChatPhoto;
  /**
   * Use this method to change the title of a chat. Titles can't be changed for private chats. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#setchattitle)
   */
  setChatTitle: api.setChatTitle;
  /**
   * Use this method to change the description of a group, a supergroup or a channel. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#setchatdescription)
   */
  setChatDescription: api.setChatDescription;
  /**
   * Use this method to add a message to the list of pinned messages in a chat. If the chat is not a private chat, the bot must be an administrator in the chat for this to work and must have the 'can\_pin\_messages' administrator right in a supergroup or 'can\_edit\_messages' administrator right in a channel. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#pinchatmessage)
   */
  pinChatMessage: api.pinChatMessage;
  /**
   * Use this method to remove a message from the list of pinned messages in a chat. If the chat is not a private chat, the bot must be an administrator in the chat for this to work and must have the 'can\_pin\_messages' administrator right in a supergroup or 'can\_edit\_messages' administrator right in a channel. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#unpinchatmessage)
   */
  unpinChatMessage: api.unpinChatMessage;
  /**
   * Use this method to clear the list of pinned messages in a chat. If the chat is not a private chat, the bot must be an administrator in the chat for this to work and must have the 'can\_pin\_messages' administrator right in a supergroup or 'can\_edit\_messages' administrator right in a channel. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#unpinallchatmessages)
   */
  unpinAllChatMessages: api.unpinAllChatMessages;
  /**
   * Use this method for your bot to leave a group, supergroup or channel. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#leavechat)
   */
  leaveChat: api.leaveChat;
  /**
   * Use this method to get up to date information about the chat (current name of the user for one-on-one conversations, current username of a user, group or channel, etc.). Returns a [Chat](https://core.telegram.org/bots/api/#chat) object on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#getchat)
   */
  getChat: api.getChat;
  /**
   * Use this method to get a list of administrators in a chat. On success, returns an Array of [ChatMember](https://core.telegram.org/bots/api/#chatmember) objects that contains information about all chat administrators except other bots. If the chat is a group or a supergroup and no administrators were appointed, only the creator will be returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#getchatadministrators)
   */
  getChatAdministrators: api.getChatAdministrators;
  /**
   * Use this method to get the number of members in a chat. Returns *Int* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#getchatmembercount)
   */
  getChatMemberCount: api.getChatMemberCount;
  /**
   * Use this method to get information about a member of a chat. Returns a [ChatMember](https://core.telegram.org/bots/api/#chatmember) object on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#getchatmember)
   */
  getChatMember: api.getChatMember;
  /**
   * Use this method to set a new group sticker set for a supergroup. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Use the field *can\_set\_sticker\_set* optionally returned in [getChat](https://core.telegram.org/bots/api/#getchat) requests to check if the bot can use this method. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#setchatstickerset)
   */
  setChatStickerSet: api.setChatStickerSet;
  /**
   * Use this method to delete a group sticker set from a supergroup. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Use the field *can\_set\_sticker\_set* optionally returned in [getChat](https://core.telegram.org/bots/api/#getchat) requests to check if the bot can use this method. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#deletechatstickerset)
   */
  deleteChatStickerSet: api.deleteChatStickerSet;
  /**
   * Use this method to send answers to callback queries sent from [inline keyboards](/bots#inline-keyboards-and-on-the-fly-updating). The answer will be displayed to the user as a notification at the top of the chat screen or as an alert. On success, *True* is returned.
   * 
   * Alternatively, the user can be redirected to the specified Game URL. For this option to work, you must first create a game for your bot via [@Botfather](https://t.me/botfather) and accept the terms. Otherwise, you may use links like `t.me/your_bot?start=XXXX` that open your bot with a parameter.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#answercallbackquery)
   */
  answerCallbackQuery: api.answerCallbackQuery;
  /**
   * Use this method to change the list of the bot's commands. See [https://core.telegram.org/bots#commands](https://core.telegram.org/bots#commands) for more details about bot commands. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#setmycommands)
   */
  setMyCommands: api.setMyCommands;
  /**
   * Use this method to delete the list of the bot's commands for the given scope and user language. After deletion, [higher level commands](https://core.telegram.org/bots/api/#determining-list-of-commands) will be shown to affected users. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#deletemycommands)
   */
  deleteMyCommands: api.deleteMyCommands;
  /**
   * Use this method to get the current list of the bot's commands for the given scope and user language. Returns Array of [BotCommand](https://core.telegram.org/bots/api/#botcommand) on success. If commands aren't set, an empty list is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#getmycommands)
   */
  getMyCommands: api.getMyCommands;
  /**
   * Use this method to change the bot's menu button in a private chat, or the default menu button. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#setchatmenubutton)
   */
  setChatMenuButton: api.setChatMenuButton;
  /**
   * Use this method to get the current value of the bot's menu button in a private chat, or the default menu button. Returns [MenuButton](https://core.telegram.org/bots/api/#menubutton) on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#getchatmenubutton)
   */
  getChatMenuButton: api.getChatMenuButton;
  /**
   * Use this method to change the default administrator rights requested by the bot when it's added as an administrator to groups or channels. These rights will be suggested to users, but they are are free to modify the list before adding the bot. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#setmydefaultadministratorrights)
   */
  setMyDefaultAdministratorRights: api.setMyDefaultAdministratorRights;
  /**
   * Use this method to get the current default administrator rights of the bot. Returns [ChatAdministratorRights](https://core.telegram.org/bots/api/#chatadministratorrights) on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#getmydefaultadministratorrights)
   */
  getMyDefaultAdministratorRights: api.getMyDefaultAdministratorRights;
  /**
   * Use this method to edit text and [game](https://core.telegram.org/bots/api/#games) messages. On success, if the edited message is not an inline message, the edited [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#editmessagetext)
   */
  editMessageText: api.editMessageText;
  /**
   * Use this method to edit captions of messages. On success, if the edited message is not an inline message, the edited [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#editmessagecaption)
   */
  editMessageCaption: api.editMessageCaption;
  /**
   * Use this method to edit animation, audio, document, photo, or video messages. If a message is part of a message album, then it can be edited only to an audio for audio albums, only to a document for document albums and to a photo or a video otherwise. When an inline message is edited, a new file can't be uploaded; use a previously uploaded file via its file\_id or specify a URL. On success, if the edited message is not an inline message, the edited [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#editmessagemedia)
   */
  editMessageMedia: api.editMessageMedia;
  /**
   * Use this method to edit only the reply markup of messages. On success, if the edited message is not an inline message, the edited [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#editmessagereplymarkup)
   */
  editMessageReplyMarkup: api.editMessageReplyMarkup;
  /**
   * Use this method to stop a poll which was sent by the bot. On success, the stopped [Poll](https://core.telegram.org/bots/api/#poll) is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#stoppoll)
   */
  stopPoll: api.stopPoll;
  /**
   * Use this method to delete a message, including service messages, with the following limitations:  
   * \- A message can only be deleted if it was sent less than 48 hours ago.  
   * \- A dice message in a private chat can only be deleted if it was sent more than 24 hours ago.  
   * \- Bots can delete outgoing messages in private chats, groups, and supergroups.  
   * \- Bots can delete incoming messages in private chats.  
   * \- Bots granted *can\_post\_messages* permissions can delete outgoing messages in channels.  
   * \- If the bot is an administrator of a group, it can delete any message there.  
   * \- If the bot has *can\_delete\_messages* permission in a supergroup or a channel, it can delete any message there.  
   * Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#deletemessage)
   */
  deleteMessage: api.deleteMessage;
  /**
   * Use this method to send static .WEBP, [animated](https://telegram.org/blog/animated-stickers) .TGS, or [video](https://telegram.org/blog/video-stickers-better-reactions) .WEBM stickers. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#sendsticker)
   */
  sendSticker: api.sendSticker;
  /**
   * Use this method to get a sticker set. On success, a [StickerSet](https://core.telegram.org/bots/api/#stickerset) object is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#getstickerset)
   */
  getStickerSet: api.getStickerSet;
  /**
   * Use this method to upload a .PNG file with a sticker for later use in *createNewStickerSet* and *addStickerToSet* methods (can be used multiple times). Returns the uploaded [File](https://core.telegram.org/bots/api/#file) on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#uploadstickerfile)
   */
  uploadStickerFile: api.uploadStickerFile;
  /**
   * Use this method to create a new sticker set owned by a user. The bot will be able to edit the sticker set thus created. You **must** use exactly one of the fields *png\_sticker*, *tgs\_sticker*, or *webm\_sticker*. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#createnewstickerset)
   */
  createNewStickerSet: api.createNewStickerSet;
  /**
   * Use this method to add a new sticker to a set created by the bot. You **must** use exactly one of the fields *png\_sticker*, *tgs\_sticker*, or *webm\_sticker*. Animated stickers can be added to animated sticker sets and only to them. Animated sticker sets can have up to 50 stickers. Static sticker sets can have up to 120 stickers. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#addstickertoset)
   */
  addStickerToSet: api.addStickerToSet;
  /**
   * Use this method to move a sticker in a set created by the bot to a specific position. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#setstickerpositioninset)
   */
  setStickerPositionInSet: api.setStickerPositionInSet;
  /**
   * Use this method to delete a sticker from a set created by the bot. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#deletestickerfromset)
   */
  deleteStickerFromSet: api.deleteStickerFromSet;
  /**
   * Use this method to set the thumbnail of a sticker set. Animated thumbnails can be set for animated sticker sets only. Video thumbnails can be set only for video sticker sets only. Returns *True* on success.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#setstickersetthumb)
   */
  setStickerSetThumb: api.setStickerSetThumb;
  /**
   * Use this method to send answers to an inline query. On success, *True* is returned.  
   * No more than **50** results per query are allowed.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#answerinlinequery)
   */
  answerInlineQuery: api.answerInlineQuery;
  /**
   * Use this method to set the result of an interaction with a [Web App](/bots/webapps) and send a corresponding message on behalf of the user to the chat from which the query originated. On success, a [SentWebAppMessage](https://core.telegram.org/bots/api/#sentwebappmessage) object is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#answerwebappquery)
   */
  answerWebAppQuery: api.answerWebAppQuery;
  /**
   * Use this method to send invoices. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#sendinvoice)
   */
  sendInvoice: api.sendInvoice;
  /**
   * If you sent an invoice requesting a shipping address and the parameter *is\_flexible* was specified, the Bot API will send an [Update](https://core.telegram.org/bots/api/#update) with a *shipping\_query* field to the bot. Use this method to reply to shipping queries. On success, *True* is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#answershippingquery)
   */
  answerShippingQuery: api.answerShippingQuery;
  /**
   * Once the user has confirmed their payment and shipping details, the Bot API sends the final confirmation in the form of an [Update](https://core.telegram.org/bots/api/#update) with the field *pre\_checkout\_query*. Use this method to respond to such pre-checkout queries. On success, *True* is returned. **Note:** The Bot API must receive an answer within 10 seconds after the pre-checkout query was sent.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#answerprecheckoutquery)
   */
  answerPreCheckoutQuery: api.answerPreCheckoutQuery;
  /**
   * Informs a user that some of the Telegram Passport elements they provided contains errors. The user will not be able to re-submit their Passport to you until the errors are fixed (the contents of the field for which you returned the error must change). Returns *True* on success.
   * 
   * Use this if the data submitted by the user doesn't satisfy the standards your service requires for any reason. For example, if a birthday date seems invalid, a submitted document is blurry, a scan shows evidence of tampering, etc. Supply some details in the error message to make sure the user knows how to correct the issues.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#setpassportdataerrors)
   */
  setPassportDataErrors: api.setPassportDataErrors;
  /**
   * Use this method to send a game. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#sendgame)
   */
  sendGame: api.sendGame;
  /**
   * Use this method to set the score of the specified user in a game message. On success, if the message is not an inline message, the [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned. Returns an error, if the new score is not greater than the user's current score in the chat and *force* is *False*.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#setgamescore)
   */
  setGameScore: api.setGameScore;
  /**
   * Use this method to get data for high score tables. Will return the score of the specified user and several of their neighbors in a game. On success, returns an *Array* of [GameHighScore](https://core.telegram.org/bots/api/#gamehighscore) objects.
   * 
   * This method will currently return scores for the target user, plus two of their closest neighbors on each side. Will also return the top three users if the user and his neighbors are not among them. Please note that this behavior is subject to change.
   * 
   * ---
   * 
   * [**Documentation**](https://core.telegram.org/bots/api/#getgamehighscores)
   */
  getGameHighScores: api.getGameHighScores;
}