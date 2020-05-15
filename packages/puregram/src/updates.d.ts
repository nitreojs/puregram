import Params from '../typings/params';
import Types from '../typings/types';
import { Middleware } from 'middleware-io';

import Context from './contexts/context';
import MessageContext from './contexts/message';
import EditedMessageContext from './contexts/edited-message';
import ChannelPostContext from './contexts/channel-post';
import EditedChannelPostContext from './contexts/edited-channel-post';
import InlineQuery from './contexts/inline-query';
import ChosenInlineResult from './contexts/chosen-inline-result';
import CallbackQuery from './contexts/callback-query';
import ShippingQuery from './contexts/shipping-query';
import PreCheckoutQuery from './contexts/pre-checkout-query';
import Poll from './contexts/poll';
import PollAnswer from './contexts/poll-answer';

import NewChatMembers from './contexts/new-chat-members';
import LeftChatMember from './contexts/left-chat-member';
import NewChatTitle from './contexts/new-chat-title';
import NewChatPhoto from './contexts/new-chat-photo';
import DeleteChatPhoto from './contexts/delete-chat-photo';
import GroupChatCreated from './contexts/group-chat-created';
import SupergroupChatCreated from './contexts/group-chat-created';
import ChannelChatCreated from './contexts/channel-chat-created';
import PinnedMessageContext from './contexts/pinned-message';
import MigrateToChatIdContext from './contexts/migrate-to-chat-id';
import MigrateFromChatIdContext from './contexts/migrate-from-chat-id';
import InvoiceContext from './contexts/invoice';
import SuccessfulPaymentContext from './contexts/successful-payment';

type HearFunctionCondition<T, U> = (value: T, context: U) => boolean;
type HearCondition<T, U> = HearFunctionCondition<T, U> | RegExp | string;
type EventTypes = Types.ContextPossibleTypes | string;
type AllowArray<T> = T | Array<T>;

type HearObjectCondition<T extends Record<string, any>> = {
  [P in keyof T]: AllowArray<HearCondition<T[P], T>>;
};

declare class Updates {
  constructor(telegram: Params.ITelegramParams);

  public startPolling(): void;
  public stopPolling(): void;
  public use(middleware: Middleware<Context>): this;
  public setHearFallbackHandler(handler: Middleware<MessageContext>): this;

  public hear(
    hearConditions: (
      AllowArray<HearCondition<string | null, MessageContext>> |
      AllowArray<HearObjectCondition<MessageContext>>
    ),
    handler: Middleware<MessageContext>,
  ): this;

  public on(events: 'message',                 handler: Middleware<MessageContext>): this;
  public on(events: 'edited_message',          handler: Middleware<EditedMessageContext>): this;
  public on(events: 'channel_post',            handler: Middleware<ChannelPostContext>): this;
  public on(events: 'edited_channel_post',     handler: Middleware<EditedChannelPostContext>): this;
  public on(events: 'inline_query',            handler: Middleware<InlineQuery>): this;
  public on(events: 'chosen_inline_result',    handler: Middleware<ChosenInlineResult>): this;
  public on(events: 'callback_query',          handler: Middleware<CallbackQuery>): this;
  public on(events: 'shipping_query',          handler: Middleware<ShippingQuery>): this;
  public on(events: 'pre_checkout_query',      handler: Middleware<PreCheckoutQuery>): this;
  public on(events: 'poll',                    handler: Middleware<Poll>): this;
  public on(events: 'poll_answer',             handler: Middleware<PollAnswer>): this;

  public on(events: 'new_chat_members',        handler: Middleware<NewChatMembers>): this;
  public on(events: 'left_chat_member',        handler: Middleware<LeftChatMember>): this;
  public on(events: 'new_chat_title',          handler: Middleware<NewChatTitle>): this;
  public on(events: 'new_chat_photo',          handler: Middleware<NewChatPhoto>): this;
  public on(events: 'delete_chat_photo',       handler: Middleware<DeleteChatPhoto>): this;
  public on(events: 'group_chat_created',      handler: Middleware<GroupChatCreated>): this;
  public on(events: 'supergroup_chat_created', handler: Middleware<SupergroupChatCreated>): this;
  public on(events: 'channel_chat_created',    handler: Middleware<ChannelChatCreated>): this;
  public on(events: 'pinned_message',          handler: Middleware<PinnedMessageContext>): this;
  public on(events: 'migrate_to_chat_id',      handler: Middleware<MigrateToChatIdContext>): this;
  public on(events: 'migrate_from_chat_id',    handler: Middleware<MigrateFromChatIdContext>): this;
  public on(events: 'invoice',                 handler: Middleware<InvoiceContext>): this;
  public on(events: 'successful_payment',      handler: Middleware<SuccessfulPaymentContext>): this;

  public on(events: AllowArray<EventTypes>,    handler: Middleware<Context>): this;
}

export = Updates;
