import { inspectable } from 'inspectable';
import http from 'http';

import {
  Middleware,
  compose,
  noopNext,
  NextMiddleware
} from 'middleware-io';

import createDebug from 'debug';

import { Telegram } from './telegram';

import {
  Context,
  MessageContext,
  CallbackQueryContext,
  InlineQueryContext,
  ChosenInlineResultContext,
  ShippingQueryContext,
  PreCheckoutQueryContext,
  PollContext,
  PollAnswerContext,
  LeftChatMemberContext,
  NewChatTitleContext,
  NewChatPhotoContext,
  DeleteChatPhotoContext,
  GroupChatCreatedContext,
  SupergroupChatCreatedContext,
  ChannelChatCreatedContext,
  MigrateToChatIdContext,
  MigrateFromChatIdContext,
  PinnedMessageContext,
  InvoiceContext,
  SuccessfulPaymentContext,
  NewChatMembersContext,
  ChatMemberContext,
  MessageAutoDeleteTimerChangedContext,
  VoiceChatStartedContext,
  VoiceChatEndedContext,
  VoiceChatParticipantsInvitedContext,
  VoiceChatScheduledContext
} from './contexts';

import { GetUpdatesParams } from './methods';
import { Composer } from './common/structures/composer';
import { User } from './common/structures/user';

import { delay, parseRequestJSON } from './utils/helpers';

import {
  TelegramUpdate,
  TelegramMessage,
  StartPollingOptions
} from './interfaces';

import {
  Constructor,
  UpdateName,
  MessageEventName
} from './types';

import { UpdateType } from './enums';

const debug = createDebug('puregram:updates');

const rawEvents: [UpdateName, Constructor<any>][] = [
  [
    'message',
    MessageContext
  ],

  [
    'edited_message',
    MessageContext
  ],

  [
    'channel_post',
    MessageContext
  ],

  [
    'edited_channel_post',
    MessageContext
  ],

  [
    'inline_query',
    InlineQueryContext
  ],

  [
    'chosen_inline_result',
    ChosenInlineResultContext
  ],

  [
    'callback_query',
    CallbackQueryContext
  ],

  [
    'shipping_query',
    ShippingQueryContext
  ],

  [
    'pre_checkout_query',
    PreCheckoutQueryContext
  ],

  [
    'poll',
    PollContext
  ],

  [
    'poll_answer',
    PollAnswerContext
  ],

  [
    'chat_member',
    ChatMemberContext
  ],

  [
    'my_chat_member',
    ChatMemberContext
  ],

  [
    'new_chat_members',
    NewChatMembersContext
  ],

  [
    'left_chat_member',
    LeftChatMemberContext
  ],

  [
    'new_chat_title',
    NewChatTitleContext
  ],

  [
    'new_chat_photo',
    NewChatPhotoContext
  ],

  [
    'new_chat_title',
    NewChatTitleContext
  ],

  [
    'delete_chat_photo',
    DeleteChatPhotoContext
  ],

  [
    'group_chat_created',
    GroupChatCreatedContext
  ],

  [
    'supergroup_chat_created',
    SupergroupChatCreatedContext
  ],

  [
    'channel_chat_created',
    ChannelChatCreatedContext
  ],

  [
    'migrate_to_chat_id',
    MigrateToChatIdContext
  ],

  [
    'migrate_from_chat_id',
    MigrateFromChatIdContext
  ],

  [
    'pinned_message',
    PinnedMessageContext
  ],

  [
    'invoice',
    InvoiceContext
  ],

  [
    'successful_payment',
    SuccessfulPaymentContext
  ],

  [
    'message_auto_delete_timer_changed',
    MessageAutoDeleteTimerChangedContext
  ],

  [
    'voice_chat_scheduled',
    VoiceChatScheduledContext
  ],

  [
    'voice_chat_started',
    VoiceChatStartedContext
  ],

  [
    'voice_chat_ended',
    VoiceChatEndedContext
  ],

  [
    'voice_chat_participants_invited',
    VoiceChatParticipantsInvitedContext
  ]
];

type ContextConstructor = Constructor<Context>;
type AllowArray<T> = T | T[];

function makeContexts(): Record<string, ContextConstructor> {
  const contexts: Record<string, ContextConstructor> = {};

  for (const [event, UpdateContext] of rawEvents) {
    contexts[event] = UpdateContext;
  }

  return contexts;
}

const events: Record<string, ContextConstructor> = makeContexts();

/** Updates class */
export class Updates {
  private readonly telegram: Telegram;

  /** Is polling started? */
  public isStarted: boolean = false;

  /** Updates offset */
  public offset: number = 0;

  private retries: number = 0;

  private composer: Composer<Context> = Composer.builder<Context>()
    .caught(
      (_context: Context, error: Error) => (
        console.error(error)
      )
    );

  private composed!: Middleware<Context>;

  /** Constructor */
  constructor(telegram: Telegram) {
    this.telegram = telegram;

    this.recompose();
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  public use<T = {}>(middleware: Middleware<Context & T>): this {
    if (typeof middleware !== 'function') {
      throw new TypeError('Middleware must be function');
    }

    this.composer.use(middleware);
    this.recompose();

    return this;
  }

  /** Subscribe to events */
  public on<T = {}>(
    events: UpdateType.MESSAGE | 'message',
    handlers: AllowArray<Middleware<MessageContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.EDITED_MESSAGE | 'edited_message',
    handlers: AllowArray<Middleware<MessageContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.CHANNEL_POST | 'channel_post',
    handlers: AllowArray<Middleware<MessageContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.EDITED_CHANNEL_POST | 'edited_channel_post',
    handlers: AllowArray<Middleware<MessageContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.INLINE_QUERY | 'inline_query',
    handlers: AllowArray<Middleware<InlineQueryContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.CHOSEN_INLINE_RESULT | 'chosen_inline_result',
    handlers: AllowArray<Middleware<ChosenInlineResultContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.CALLBACK_QUERY | 'callback_query',
    handlers: AllowArray<Middleware<CallbackQueryContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.SHIPPING_QUERY | 'shipping_query',
    handlers: AllowArray<Middleware<ShippingQueryContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.PRE_CHECKOUT_QUERY | 'pre_checkout_query',
    handlers: AllowArray<Middleware<PreCheckoutQueryContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.POLL | 'poll',
    handlers: AllowArray<Middleware<PollContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.POLL_ANSWER | 'poll_answer',
    handlers: AllowArray<Middleware<PollAnswerContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.CHAT_MEMBER | 'chat_member',
    handlers: AllowArray<Middleware<ChatMemberContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.MY_CHAT_MEMBER | 'my_chat_member',
    handlers: AllowArray<Middleware<ChatMemberContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.NEW_CHAT_MEMBERS | 'new_chat_members',
    handlers: AllowArray<Middleware<NewChatMembersContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.LEFT_CHAT_MEMBER | 'left_chat_member',
    handlers: AllowArray<Middleware<LeftChatMemberContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.NEW_CHAT_TITLE | 'new_chat_title',
    handlers: AllowArray<Middleware<NewChatTitleContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.NEW_CHAT_PHOTO | 'new_chat_photo',
    handlers: AllowArray<Middleware<NewChatPhotoContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.DELETE_CHAT_PHOTO | 'delete_chat_photo',
    handlers: AllowArray<Middleware<DeleteChatPhotoContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.GROUP_CHAT_CREATED | 'group_chat_created',
    handlers: AllowArray<Middleware<GroupChatCreatedContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.SUPERGROUP_CHAT_CREATED | 'supergroup_chat_created',
    handlers: AllowArray<Middleware<SupergroupChatCreatedContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.CHANNEL_CHAT_CREATED | 'channel_chat_created',
    handlers: AllowArray<Middleware<ChannelChatCreatedContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.PINNED_MESSAGE | 'pinned_message',
    handlers: AllowArray<Middleware<PinnedMessageContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.MIGRATE_FROM_TO_ID | 'migrate_to_chat_id',
    handlers: AllowArray<Middleware<MigrateToChatIdContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.MIGRATE_FROM_CHAT_ID | 'migrate_from_chat_id',
    handlers: AllowArray<Middleware<MigrateFromChatIdContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.INVOICE | 'invoice',
    handlers: AllowArray<Middleware<InvoiceContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.SUCCESSFUL_PAYMENT | 'successful_payment',
    handlers: AllowArray<Middleware<SuccessfulPaymentContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.MESSAGE_AUTO_DELETE_TIMER_CHANGED | 'message_auto_delete_timer_changed',
    handlers: AllowArray<Middleware<MessageAutoDeleteTimerChangedContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.VOICE_CHAT_SCHEDULED | 'voice_chat_scheduled',
    handlers: AllowArray<Middleware<VoiceChatScheduledContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.VOICE_CHAT_STARTED | 'voice_chat_started',
    handlers: AllowArray<Middleware<VoiceChatStartedContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.VOICE_CHAT_ENDED | 'voice_chat_ended',
    handlers: AllowArray<Middleware<VoiceChatEndedContext & T>>
  ): this;

  public on<T = {}>(
    events: UpdateType.VOICE_CHAT_PARTICIPANTS_INVITED | 'voice_chat_participants_invited',
    handlers: AllowArray<Middleware<VoiceChatParticipantsInvitedContext & T>>
  ): this;

  public on<T = {}>(
    events: AllowArray<UpdateName | UpdateType | string>,
    handlers: AllowArray<Middleware<Context & T>>
  ): this;

  public on<T = {}>(
    rawOnEvents: AllowArray<UpdateName | UpdateType | string>,
    rawHandlers: AllowArray<Middleware<Context & T>>
  ): this {
    const onEvents = Array.isArray(rawOnEvents)
      ? rawOnEvents
      : [rawOnEvents];

    const hasEvents = onEvents.every(Boolean);

    if (!hasEvents) {
      throw new TypeError('Events must be not empty');
    }

    const handler = Array.isArray(rawHandlers)
      ? compose(rawHandlers)
      : rawHandlers;

    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be function');
    }

    return this.use(
      (context: Context & T, next: NextMiddleware): unknown => (
        context.is(onEvents)
          ? handler(context, next)
          : next()
      )
    );
  }

  /** Calls up the middleware chain */
  public dispatchMiddleware(context: Context): Promise<void> {
    return this.composed(context, noopNext) as Promise<void>;
  }

  private recompose(): void {
    this.composed = this.composer.compose();
  }

  /** Stop polling */
  public stopPolling(): void {
    this.isStarted = false;
  }

  /** Start polling */
  public async startPolling(options: StartPollingOptions = {}): Promise<void> {
    if (this.isStarted) {
      throw new Error('Polling is already started');
    }

    if (!this.telegram.options.token) {
      debug('Bot token is not set. Perhaps you forgot to set it?');
    }

    debug('Fetching bot data...');

    const bot: User = new User(
      await this.telegram.api.getMe()
    );

    this.telegram.bot = bot;

    debug('Telegram bot data fetched.');
    debug(bot);

    this.isStarted = true;

    try {
      this.startFetchLoop(options);
    } catch (e) {
      this.isStarted = false;

      throw e;
    }
  }

  private async startFetchLoop(options: StartPollingOptions): Promise<void> {
    while (this.isStarted) {
      try {
        await this.fetchUpdates(options);
      } catch (e) {
        debug('startFetchLoop:', e);

        if (this.retries === this.telegram.options.apiRetryLimit) {
          return;
        }

        this.retries += 1;

        await delay(this.telegram.options.apiWait!);

        this.stopPolling();
        this.startPolling();
      }
    }
  }

  private async fetchUpdates(options: StartPollingOptions): Promise<void> {
    const params: Partial<GetUpdatesParams> = {
      timeout: 15,
      allowed_updates: this.telegram.options.allowedUpdates!
    };

    if (this.offset) params.offset = this.offset;
    if (options.updateOffset) params.offset = options.updateOffset;

    const updates: TelegramUpdate[] = await this.telegram.api.getUpdates(params);

    if (!updates.length) return;

    updates.forEach(
      async (update: TelegramUpdate) => {
        try {
          await this.updateHandler(update);
        } catch (e) {
          debug('fetchUpdates:', e);
        }
      }
    );
  }

  public async updateHandler(
    update: TelegramUpdate & Partial<
      Pick<TelegramMessage, MessageEventName>
    >
  ): Promise<void> {
    this.offset = update.update_id + 1;

    const type: UpdateName = (Object.keys(update) as UpdateName[])[1];

    let UpdateContext: ContextConstructor = events[type];

    debug('Event type:', type);

    if (!UpdateContext) {
      debug(`Unsupported context type ${type}`);

      return;
    }

    debug('Update payload:', update[type]);

    let context: Context & {
      isEvent?: boolean,
      eventType?: MessageEventName
    } = new UpdateContext(this.telegram, update[type], type);

    const isEvent: boolean = context.isEvent === true && context.eventType !== undefined;

    debug('Is event?', isEvent);

    if (isEvent) {
      UpdateContext = events[context.eventType!];

      context = new UpdateContext(this.telegram, update.message);
    }

    debug(context);

    this.dispatchMiddleware(context);
  }

  public getKoaMiddleware(): Function {
    return async (context: any): Promise<void> => {
      const update: any = context.request.body;

      if (update === undefined) {
        context.status = 500;

        throw new Error('request.body is undefined. Are you sure you parsed it (e.g. via koa-body)?');
      }

      context.status = 200;
      context.set('connection', 'keep-alive');

      setImmediate(() => this.updateHandler(update));
    };
  }

  public getWebhookMiddleware(): (req: http.IncomingMessage, res: http.ServerResponse) => Promise<void> {
    return async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
      if (req.method !== 'POST') {
        return;
      }

      const reqBody = (req as typeof req & { body: string | Record<string, any>; }).body;

      let update: any;

      try {
        update = typeof reqBody === 'object' ? reqBody : await parseRequestJSON(req);
      } catch (error) {
        debug(error);

        return;
      }

      if (update === undefined) {
        res.writeHead(500);
        res.end();
  
        throw new Error('req.body is undefined. Are you sure you parsed it (e.g. via body-parser)?');
      }

      res.writeHead(200);
      res.end();

      setImmediate(() => this.updateHandler(update));
    }
  }
}

inspectable(Updates, {
  serialize(updates: Updates) {
    return {
      isStarted: updates.isStarted,
      offset: updates.offset
    };
  }
});
