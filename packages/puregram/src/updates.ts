import { inspectable } from 'inspectable';

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
  NewChatMembersContext
} from './contexts';

import { GetUpdatesParams } from './methods';
import { Composer } from './common/structures/composer';
import { User } from './common/structures/user';

import { delay } from './utils/helpers';

import {
  TelegramUpdate,
  TelegramMessage
} from './interfaces';

import {
  Constructor,
  UpdateName,
  MessageEventName
} from './types';

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
    events: 'message',
    handlers: AllowArray<Middleware<MessageContext & T>>
  ): this;

  public on<T = {}>(
    events: 'edited_message',
    handlers: AllowArray<Middleware<MessageContext & T>>
  ): this;

  public on<T = {}>(
    events: 'channel_post',
    handlers: AllowArray<Middleware<MessageContext & T>>
  ): this;

  public on<T = {}>(
    events: 'edited_channel_post',
    handlers: AllowArray<Middleware<MessageContext & T>>
  ): this;

  public on<T = {}>(
    events: 'inline_query',
    handlers: AllowArray<Middleware<InlineQueryContext & T>>
  ): this;

  public on<T = {}>(
    events: 'chosen_inline_result',
    handlers: AllowArray<Middleware<ChosenInlineResultContext & T>>
  ): this;

  public on<T = {}>(
    events: 'callback_query',
    handlers: AllowArray<Middleware<CallbackQueryContext & T>>
  ): this;

  public on<T = {}>(
    events: 'shipping_query',
    handlers: AllowArray<Middleware<ShippingQueryContext & T>>
  ): this;

  public on<T = {}>(
    events: 'pre_checkout_query',
    handlers: AllowArray<Middleware<PreCheckoutQueryContext & T>>
  ): this;

  public on<T = {}>(
    events: 'poll',
    handlers: AllowArray<Middleware<PollContext & T>>
  ): this;

  public on<T = {}>(
    events: 'poll_answer',
    handlers: AllowArray<Middleware<PollAnswerContext & T>>
  ): this;

  public on<T = {}>(
    events: 'new_chat_members',
    handlers: AllowArray<Middleware<NewChatMembersContext & T>>
  ): this;

  public on<T = {}>(
    events: 'left_chat_member',
    handlers: AllowArray<Middleware<LeftChatMemberContext & T>>
  ): this;

  public on<T = {}>(
    events: 'new_chat_title',
    handlers: AllowArray<Middleware<NewChatTitleContext & T>>
  ): this;

  public on<T = {}>(
    events: 'new_chat_photo',
    handlers: AllowArray<Middleware<NewChatPhotoContext & T>>
  ): this;

  public on<T = {}>(
    events: 'delete_chat_photo',
    handlers: AllowArray<Middleware<DeleteChatPhotoContext & T>>
  ): this;

  public on<T = {}>(
    events: 'group_chat_created',
    handlers: AllowArray<Middleware<GroupChatCreatedContext & T>>
  ): this;

  public on<T = {}>(
    events: 'supergroup_chat_created',
    handlers: AllowArray<Middleware<SupergroupChatCreatedContext & T>>
  ): this;

  public on<T = {}>(
    events: 'channel_chat_created',
    handlers: AllowArray<Middleware<ChannelChatCreatedContext & T>>
  ): this;

  public on<T = {}>(
    events: 'pinned_message',
    handlers: AllowArray<Middleware<PinnedMessageContext & T>>
  ): this;

  public on<T = {}>(
    events: 'migrate_to_chat_id',
    handlers: AllowArray<Middleware<MigrateToChatIdContext & T>>
  ): this;

  public on<T = {}>(
    events: 'migrate_from_chat_id',
    handlers: AllowArray<Middleware<MigrateFromChatIdContext & T>>
  ): this;

  public on<T = {}>(
    events: 'invoice',
    handlers: AllowArray<Middleware<InvoiceContext & T>>
  ): this;

  public on<T = {}>(
    events: 'successful_payment',
    handlers: AllowArray<Middleware<SuccessfulPaymentContext & T>>
  ): this;

  public on<T = {}>(
    events: AllowArray<UpdateName | string>,
    handlers: AllowArray<Middleware<Context & T>>
  ): this;

  public on<T = {}>(
    rawOnEvents: AllowArray<UpdateName | string>,
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
  public async startPolling(): Promise<void> {
    if (this.isStarted) {
      throw new Error('Polling is already started');
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
      this.startFetchLoop();
    } catch (e) {
      this.isStarted = false;

      throw e;
    }
  }

  private async startFetchLoop(): Promise<void> {
    while (this.isStarted) {
      try {
        await this.fetchUpdates();
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

  private async fetchUpdates(): Promise<void> {
    const params: Partial<GetUpdatesParams> = {
      timeout: 15
    };

    if (this.offset) params.offset = this.offset;

    const updates: TelegramUpdate[] = await this.telegram.api.getUpdates(params);

    if (!updates.length) return;

    updates.forEach(
      async (update: TelegramUpdate) => {
        try {
          await this.pollingHandler(update);
        } catch (e) {
          debug('fetchUpdates:', e);
        }
      }
    );
  }

  private async pollingHandler(
    update: TelegramUpdate & Partial<
      Pick<TelegramMessage, MessageEventName>
    >
  ): Promise<void> {
    this.offset = update.update_id + 1;

    const type: UpdateName = (
      Object.keys(update) as UpdateName[]
    )[1];

    let UpdateContext: ContextConstructor = events[type];

    if (!UpdateContext) {
      debug(`Unsupported context type ${type}`);

      return;
    }

    let context: Context & ({
      isEvent?: boolean,
      eventType?: MessageEventName
    }) = new UpdateContext(
      this.telegram,
      update[type]
    );

    debug('is event?', (context.isEvent && context.eventType !== undefined));

    if (context.isEvent && context.eventType !== undefined) {
      UpdateContext = events[context.eventType];

      context = new UpdateContext(
        this.telegram,
        update.message
      );
    }

    debug(context);

    this.dispatchMiddleware(context);
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
