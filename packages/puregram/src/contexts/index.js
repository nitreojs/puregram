let Context = require('./context');
let Message = require('./message');
let EditedMessage = require('./edited-message');
let ChannelPost = require('./channel-post');
let EditedChannelPost = require('./edited-channel-post');
let InlineQuery = require('./inline-query');
let CallbackQuery = require('./callback-query');
let ChosenInlineResult = require('./chosen-inline-result');
let PreCheckoutQuery = require('./pre-checkout-query');
let Poll = require('./poll');

let NewChatMembers = require('./new-chat-members');
let LeftChatMember = require('./left-chat-member');
let NewChatTitle = require('./new-chat-title');
let NewChatPhoto = require('./new-chat-photo');
let DeleteChatPhoto = require('./delete-chat-photo');
let GroupChatCreated = require('./group-chat-created');
let SupergroupChatCreated = require('./supergroup-chat-created');
let ChannelChatCreated = require('./channel-chat-created');
let PinnedMessage = require('./pinned-message');
let MigrateToChatId = require('./migrate-to-chat-id');
let MigrateFromChatId = require('./migrate-from-chat-id');
let Invoice = require('./invoice');
let SuccessfulPayment = require('./successful-payment');

module.exports = {
  Context,
  Message,
  EditedMessage,
  ChannelPost,
  EditedChannelPost,
  InlineQuery,
  CallbackQuery,
  ChosenInlineResult,
  PreCheckoutQuery,
  Poll,

  NewChatMembers,
  LeftChatMember,
  NewChatTitle,
  NewChatPhoto,
  DeleteChatPhoto,
  GroupChatCreated,
  SupergroupChatCreated,
  ChannelChatCreated,
  PinnedMessage,
  MigrateToChatId,
  MigrateFromChatId,
  Invoice,
  SuccessfulPayment,
};
