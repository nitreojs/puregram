import { inspectable } from 'inspectable'
import http from 'http'

import {
  Middleware,
  compose,
  noopNext,
  NextMiddleware
} from 'middleware-io'

import createDebug from 'debug'

import * as Contexts from './contexts'

import { Composer } from './common/structures/composer'
import { User } from './common/structures/user'

import { Telegram } from './telegram'
import { GetUpdatesParams } from './methods'
import { delay, parseRequestJSON } from './utils/helpers'
import { TelegramUpdate, TelegramUser } from './telegram-interfaces'
import { StartPollingOptions } from './interfaces'
import { Constructor, UpdateName, MessageEventName } from './types'
import { UpdateType } from './enums'
import { TelegramError } from './errors'

const debug = createDebug('puregram:updates')

const rawEvents: [UpdateName, Constructor<any>][] = [
  ['message', Contexts.MessageContext],
  ['edited_message', Contexts.MessageContext],
  ['channel_post', Contexts.MessageContext],
  ['edited_channel_post', Contexts.MessageContext],
  ['inline_query', Contexts.InlineQueryContext],
  ['chosen_inline_result', Contexts.ChosenInlineResultContext],
  ['callback_query', Contexts.CallbackQueryContext],
  ['shipping_query', Contexts.ShippingQueryContext],
  ['pre_checkout_query', Contexts.PreCheckoutQueryContext],
  ['poll', Contexts.PollContext],
  ['poll_answer', Contexts.PollAnswerContext],
  ['chat_member', Contexts.ChatMemberContext],
  ['my_chat_member', Contexts.ChatMemberContext],
  ['new_chat_members', Contexts.NewChatMembersContext],
  ['left_chat_member', Contexts.LeftChatMemberContext],
  ['new_chat_title', Contexts.NewChatTitleContext],
  ['new_chat_photo', Contexts.NewChatPhotoContext],
  ['new_chat_title', Contexts.NewChatTitleContext],
  ['delete_chat_photo', Contexts.DeleteChatPhotoContext],
  ['group_chat_created', Contexts.GroupChatCreatedContext],
  ['supergroup_chat_created', Contexts.SupergroupChatCreatedContext],
  ['channel_chat_created', Contexts.ChannelChatCreatedContext],
  ['migrate_to_chat_id', Contexts.MigrateToChatIdContext],
  ['migrate_from_chat_id', Contexts.MigrateFromChatIdContext],
  ['pinned_message', Contexts.PinnedMessageContext],
  ['invoice', Contexts.InvoiceContext],
  ['successful_payment', Contexts.SuccessfulPaymentContext],
  ['message_auto_delete_timer_changed', Contexts.MessageAutoDeleteTimerChangedContext],
  ['video_chat_scheduled', Contexts.VideoChatScheduledContext],
  ['video_chat_started', Contexts.VideoChatStartedContext],
  ['video_chat_ended', Contexts.VideoChatEndedContext],
  ['video_chat_participants_invited', Contexts.VideoChatParticipantsInvitedContext],
  ['web_app_data', Contexts.WebAppDataContext],
  ['chat_join_request', Contexts.ChatJoinRequestContext]
]

type ContextConstructor = Constructor<Contexts.Context>
type AllowArray<T> = T | T[]

function makeContexts(): Record<string, ContextConstructor> {
  const contexts: Record<string, ContextConstructor> = {}

  for (const [event, UpdateContext] of rawEvents) {
    contexts[event] = UpdateContext
  }

  return contexts
}

const events: Record<string, ContextConstructor> = makeContexts()

/** Updates class */
export class Updates {
  private readonly telegram: Telegram

  /** Is polling started? */
  public isStarted: boolean = false;

  /** Updates offset */
  public offset: number = 0;

  private retries: number = 0;

  private composer: Composer<Contexts.Context> = Composer.builder<Contexts.Context>()
    .caught(
      (_context: Contexts.Context, error: Error) => (
        console.error(error)
      )
    );

  private composed!: Middleware<Contexts.Context>

  /** Constructor */
  constructor(telegram: Telegram) {
    this.telegram = telegram

    this.recompose()
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  public use<T = {}>(middleware: Middleware<Contexts.Context & T>): this {
    if (typeof middleware !== 'function') {
      throw new TypeError('Middleware must be function')
    }

    this.composer.use(middleware)
    this.recompose()

    return this
  }

  /** Subscribe to events */
  public on<T = {}>(
    events: UpdateType.MESSAGE | 'message',
    handlers: AllowArray<Middleware<Contexts.MessageContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.EDITED_MESSAGE | 'edited_message',
    handlers: AllowArray<Middleware<Contexts.MessageContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.CHANNEL_POST | 'channel_post',
    handlers: AllowArray<Middleware<Contexts.MessageContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.EDITED_CHANNEL_POST | 'edited_channel_post',
    handlers: AllowArray<Middleware<Contexts.MessageContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.INLINE_QUERY | 'inline_query',
    handlers: AllowArray<Middleware<Contexts.InlineQueryContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.CHOSEN_INLINE_RESULT | 'chosen_inline_result',
    handlers: AllowArray<Middleware<Contexts.ChosenInlineResultContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.CALLBACK_QUERY | 'callback_query',
    handlers: AllowArray<Middleware<Contexts.CallbackQueryContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.SHIPPING_QUERY | 'shipping_query',
    handlers: AllowArray<Middleware<Contexts.ShippingQueryContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.PRE_CHECKOUT_QUERY | 'pre_checkout_query',
    handlers: AllowArray<Middleware<Contexts.PreCheckoutQueryContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.POLL | 'poll',
    handlers: AllowArray<Middleware<Contexts.PollContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.POLL_ANSWER | 'poll_answer',
    handlers: AllowArray<Middleware<Contexts.PollAnswerContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.CHAT_MEMBER | 'chat_member',
    handlers: AllowArray<Middleware<Contexts.ChatMemberContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.MY_CHAT_MEMBER | 'my_chat_member',
    handlers: AllowArray<Middleware<Contexts.ChatMemberContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.NEW_CHAT_MEMBERS | 'new_chat_members',
    handlers: AllowArray<Middleware<Contexts.NewChatMembersContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.LEFT_CHAT_MEMBER | 'left_chat_member',
    handlers: AllowArray<Middleware<Contexts.LeftChatMemberContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.NEW_CHAT_TITLE | 'new_chat_title',
    handlers: AllowArray<Middleware<Contexts.NewChatTitleContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.NEW_CHAT_PHOTO | 'new_chat_photo',
    handlers: AllowArray<Middleware<Contexts.NewChatPhotoContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.DELETE_CHAT_PHOTO | 'delete_chat_photo',
    handlers: AllowArray<Middleware<Contexts.DeleteChatPhotoContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.GROUP_CHAT_CREATED | 'group_chat_created',
    handlers: AllowArray<Middleware<Contexts.GroupChatCreatedContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.SUPERGROUP_CHAT_CREATED | 'supergroup_chat_created',
    handlers: AllowArray<Middleware<Contexts.SupergroupChatCreatedContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.CHANNEL_CHAT_CREATED | 'channel_chat_created',
    handlers: AllowArray<Middleware<Contexts.ChannelChatCreatedContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.PINNED_MESSAGE | 'pinned_message',
    handlers: AllowArray<Middleware<Contexts.PinnedMessageContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.MIGRATE_FROM_TO_ID | 'migrate_to_chat_id',
    handlers: AllowArray<Middleware<Contexts.MigrateToChatIdContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.MIGRATE_FROM_CHAT_ID | 'migrate_from_chat_id',
    handlers: AllowArray<Middleware<Contexts.MigrateFromChatIdContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.INVOICE | 'invoice',
    handlers: AllowArray<Middleware<Contexts.InvoiceContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.SUCCESSFUL_PAYMENT | 'successful_payment',
    handlers: AllowArray<Middleware<Contexts.SuccessfulPaymentContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.MESSAGE_AUTO_DELETE_TIMER_CHANGED | 'message_auto_delete_timer_changed',
    handlers: AllowArray<Middleware<Contexts.MessageAutoDeleteTimerChangedContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.VIDEO_CHAT_SCHEDULED | 'video_chat_scheduled',
    handlers: AllowArray<Middleware<Contexts.VideoChatScheduledContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.VIDEO_CHAT_STARTED | 'video_chat_started',
    handlers: AllowArray<Middleware<Contexts.VideoChatStartedContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.VIDEO_CHAT_ENDED | 'video_chat_ended',
    handlers: AllowArray<Middleware<Contexts.VideoChatEndedContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.VIDEO_CHAT_PARTICIPANTS_INVITED | 'video_chat_participants_invited',
    handlers: AllowArray<Middleware<Contexts.VideoChatParticipantsInvitedContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.WEB_APP_DATA | 'web_app_data',
    handlers: AllowArray<Middleware<Contexts.WebAppDataContext & T>>
  ): this

  public on<T = {}>(
    events: UpdateType.CHAT_JOIN_REQUEST | 'chat_join_request',
    handlers: AllowArray<Middleware<Contexts.ChatJoinRequestContext & T>>
  ): this

  public on<T = {}>(
    events: AllowArray<string>,
    handlers: AllowArray<Middleware<Contexts.Context & T>>
  ): this

  public on<T = {}>(
    rawOnEvents: AllowArray<string>,
    rawHandlers: AllowArray<Middleware<Contexts.Context & T>>
  ): this {
    const onEvents = Array.isArray(rawOnEvents)
      ? rawOnEvents
      : [rawOnEvents]

    const hasEvents = onEvents.every(Boolean)

    if (!hasEvents) {
      throw new TypeError('Events must be not empty')
    }

    const handler = Array.isArray(rawHandlers)
      ? compose(rawHandlers)
      : rawHandlers

    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be function')
    }

    return this.use(
      (context: Contexts.Context & T, next: NextMiddleware): unknown => (
        context.is(onEvents)
          ? handler(context, next)
          : next()
      )
    )
  }

  /** Calls up the middleware chain */
  public dispatchMiddleware(context: Contexts.Context): Promise<void> {
    return this.composed(context, noopNext) as Promise<void>
  }

  private recompose(): void {
    this.composed = this.composer.compose()
  }

  /** Stop polling */
  public stopPolling(): void {
    this.isStarted = false
    this.retries = 0
  }

  /** Start polling */
  public async startPolling(options: StartPollingOptions = {}): Promise<void> {
    if (this.isStarted) {
      throw new Error('Polling is already started')
    }

    if (!this.telegram.options.token) {
      throw new TypeError('Token is not set. Perhaps you forgot to set it?')
    }

    if (!this.telegram.bot) {
      debug('Fetching bot data...')

      let me!: TelegramUser

      try {
        me = await this.telegram.api.getMe()
      } catch (error) {
        debug('Unable to fetch bot info, perhaps no internet connection?')

        throw new TelegramError({
          error_code: -1,
          description: 'Unable to fetch bot data from the start'
        })
      }

      const bot: User = new User(me)

      this.telegram.bot = bot

      debug('Bot data fetched successfully:')
      debug(bot)
    }

    this.isStarted = true

    try {
      this.startFetchLoop(options)
    } catch (error) {
      this.isStarted = false

      throw error
    }
  }

  private async startFetchLoop(options: StartPollingOptions): Promise<void> {
    try {
      while (this.isStarted) {
        await this.fetchUpdates(options)
      }
    } catch (error) {
      debug(error)

      if (this.telegram.options.apiRetryLimit === -1) {
        debug('Trying to reconnect...')
      } else if (this.retries === this.telegram.options.apiRetryLimit) {
        if (this.telegram.options.apiRetryLimit === 0) {
          return debug('`apiRetryLimit` is set to 0, not trying to reconnect')
        }

        return debug(`Tried to reconnect ${this.retries} times, but it didn't work, cya next time`)
      } else {
        this.retries += 1

        debug(`Trying to reconnect, ${this.retries}/${this.telegram.options.apiRetryLimit} try`)
      }

      await delay(this.telegram.options.apiWait!)

      // not this.stopPolling() because it resets this.retries
      this.isStarted = false

      this.startPolling()
    }
  }

  private async fetchUpdates(options: StartPollingOptions): Promise<void> {
    const params: Partial<GetUpdatesParams> = {
      timeout: 15,
      allowed_updates: this.telegram.options.allowedUpdates!
    }

    if (this.offset) params.offset = this.offset
    if (options.offset) params.offset = options.offset
    if (options.timeout) params.timeout = options.timeout

    const updates: TelegramUpdate[] = await this.telegram.api.getUpdates(params)

    if (!updates) {
      /// Something is wrong with the internet connection I can feel it...

      debug('`fetchUpdates` error: unable to get updates')

      this.stopPolling()
      this.startPolling()

      return
    }

    if (!updates.length) return

    updates.forEach(
      async (update: TelegramUpdate) => {
        try {
          await this.handleUpdate(update)
        } catch (error) {
          debug('`fetchUpdates` error:')
          debug(error)
        }
      }
    )
  }

  public async handleUpdate(update: TelegramUpdate): Promise<Contexts.Context | undefined> {
    this.offset = update.update_id + 1

    const type: UpdateName = (Object.keys(update) as UpdateName[])[1]

    let UpdateContext: ContextConstructor = events[type]

    debug('Event type:', type)

    if (!UpdateContext) {
      debug(`Unsupported context type \`${type}\``)

      return
    }

    debug('Update payload:')
    debug(update[type])

    let context: Contexts.Context & { isEvent?: boolean, eventType?: MessageEventName } = new UpdateContext({
      telegram: this.telegram,
      update,
      payload: update[type],
      type,
      updateId: update.update_id
    })

    const isEvent: boolean = context.isEvent === true && context.eventType !== undefined

    debug('Is event?', isEvent)

    if (isEvent) {
      UpdateContext = events[context.eventType!]

      context = new UpdateContext({
        telegram: this.telegram,
        update,
        payload: update.message,
        type: context.eventType!,
        updateId: update.update_id
      })
    }

    debug(context)

    this.dispatchMiddleware(context)

    return context
  }

  public getKoaMiddleware(): Function {
    return async (context: any): Promise<void> => {
      const update: any = context.request.body

      if (update === undefined) {
        context.status = 500

        throw new Error('request.body is undefined. Are you sure you parsed it (e.g. via koa-body)?')
      }

      context.status = 200
      context.set('connection', 'keep-alive')

      setImmediate(() => this.handleUpdate(update))
    }
  }

  public getWebhookMiddleware(): (req: http.IncomingMessage, res: http.ServerResponse) => Promise<void> {
    return async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
      if (req.method !== 'POST') {
        return
      }

      const reqBody = (req as typeof req & { body: string | Record<string, any> }).body

      let update: any

      try {
        update = typeof reqBody === 'object' ? reqBody : await parseRequestJSON(req)
      } catch (error) {
        debug(error)

        return
      }

      if (update === undefined) {
        res.writeHead(500)
        res.end()

        throw new Error('req.body is undefined. Are you sure you parsed it (e.g. via body-parser)?')
      }

      res.writeHead(200)
      res.end()

      setImmediate(() => this.handleUpdate(update))
    }
  }
}

inspectable(Updates, {
  serialize(updates: Updates) {
    return {
      isStarted: updates.isStarted,
      offset: updates.offset
    }
  }
})
