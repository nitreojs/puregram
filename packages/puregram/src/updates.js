let middlewareIo = require('middleware-io');
let debug = require('debug')('puregram:updates');

let Contexts = require('./contexts');

let User = require('./structures/user');

let contexts = {
  message: Contexts.Message,
  edited_message: Contexts.EditedMessage,
  channel_post: Contexts.ChannelPost,
  edited_channel_post: Contexts.EditedChannelPost,
  inline_query: Contexts.InlineQuery,
  callback_query: Contexts.CallbackQuery,
  chosen_inline_result: Contexts.ChosenInlineResult,
  pre_checkout_query: Contexts.PreCheckoutQuery,
  poll: Contexts.Poll,
  poll_answer: Contexts.PollAnswer,

  new_chat_members: Contexts.NewChatMembers,
  left_chat_member: Contexts.LeftChatMember,
  new_chat_title: Contexts.NewChatTitle,
  new_chat_photo: Contexts.NewChatPhoto,
  delete_chat_photo: Contexts.DeleteChatPhoto,
  group_chat_created: Contexts.GroupChatCreated,
  supergroup_chat_created: Contexts.SupergroupChatCreated,
  channel_chat_created: Contexts.ChannelChatCreated,
  pinned_message: Contexts.PinnedMessage,
  migrate_to_chat_id: Contexts.MigrateToChatId,
  migrate_from_chat_id: Contexts.MigrateFromChatId,
  invoice: Contexts.Invoice,
  successful_payment: Contexts.SuccessfulPayment,
};

let splitPath = (path) => (
  path
    .replace(/\[([^[\]]*)\]/g, '.$1.')
    .split('.')
    .filter(Boolean)
);

let getObjectValue = (source, selectors) => {
  let link = source;

  for (let selector of selectors) {
    if (!link[selector]) {
      return undefined;
    }

    link = link[selector];
  }

  return link;
};

let unifyCondition = (condition) => {
  if (typeof condition === 'function') {
    return condition;
  }

  if (condition instanceof RegExp) {
    return (text) => (
      condition.test(text)
    );
  }

  if (Array.isArray(condition)) {
    let arrayConditions = condition.map(unifyCondition);

    return (value) => (
      Array.isArray(value)
        ? arrayConditions.every((cond) => (
          value.some((val) => cond(val))
        ))
        : arrayConditions.some((cond) => (
          cond(value)
        ))
    );
  }

  return (value) => value === condition;
};

class Updates {
  constructor(telegram) {
    this.telegram = telegram;
    this.api = this.telegram.api;

    this.isStarted = false;

    this.stack = [];
    this.hearStack = [];

    this.hearFallbackHandler = (_context, next) => next();

    this.reloadMiddleware();

    this.offset = null;
  }

  setHearFallbackHandler(handler) {
    this.hearFallbackHandler = handler;

    return this;
  }

  use(...middlewares) {
    middlewares.forEach((middleware) => {
      if (typeof middleware !== 'function') {
        throw new Error('Middleware must be a function');
      }

      this.stack.push(middleware);
    });

    this.reloadMiddleware();

    return this;
  }

  async startPolling() {
    if (this.isStarted) {
      throw new Error('Polling is already started');
    }

    this.isStarted = true;

    // Fetching bot data
    let data = await this.api.getMe();

    this.telegram.bot = new User(data);

    debug('Fetched bot data');
    debug(this.telegram.bot);

    try {
      this.startFetchLoop();
    } catch (e) {
      this.isStarted = false;

      debug('startPolling error');
      debug(e);

      throw e;
    }
  }

  stopPolling() {
    this.isStarted = false;
  }

  async startFetchLoop() {
    while (this.isStarted) {
      try {
        await this.fetchUpdates();
      } catch (e) {
        debug('startFetchLoop error');
        debug(e);

        this.stopPolling();
        await this.startPolling();
      }
    }
  }

  async fetchUpdates() {
    let params = {};

    if (this.offset) params.offset = this.offset;

    let updates = await this.api.getUpdates(params);

    if (!updates.length) return;

    if (this.telegram.mergeEvents) {
      try {
        await this.mergePollingHandler(updates);
      } catch (e) {
        console.error('Handle polling update merging error:', e);
      }
    } else {
      updates.forEach(
        async (update) => {
          try {
            await this.pollingHandler(update);
          } catch (e) {
            console.error('Handle polling update error:', e);
          }
        }
      );
    }
  }

  async pollingHandler(update, merging = false) {
    this.offset = update.update_id + 1 || this.offset;

    let type = Object.keys(update).slice(1)[0];

    debug(update);

    let Context = contexts[type];

    if (!Context) {
      throw new Error('Context not found');
    }

    let context = new Context(
      this.telegram,
      update[type],
    );

    debug('is event?', context.isEvent && context.eventType);

    if (context.isEvent && context.eventType) {
      Context = contexts[context.eventType];

      debug(Context);
      debug(update.message);

      context = new Context(
        this.telegram,
        update.message,
      );

      debug(context);
    }

    if (!merging) return this.dispatchMiddleware(context);

    return context;
  }

  async mergePollingHandler(updates) {
    // eslint-cringe-code-linter-enable

    const kContexts = await Promise.all(
      updates.map(
        update => this.pollingHandler(update, true)
      )
    );

    const fContexts = kContexts.filter(
      xContext => xContext.mediaGroupId
    );

    if (!fContexts.length) {
      return updates.forEach(
        async (update) => {
          try {
            await this.pollingHandler(update);
          } catch (e) {
            console.error('Handle polling update error:', e);
          }
        }
      );
    }

    const mediaGroupIds = {};

    fContexts.forEach(
      (update) => {
        if (!mediaGroupIds[update.mediaGroupId]) {
          mediaGroupIds[update.mediaGroupId] = [];
        }

        mediaGroupIds[update.mediaGroupId].push(
          update
        );
      }
    );

    const actualContexts = [];

    //         Array<Context>
    for (const arrayOfContexts of Object.values(mediaGroupIds)) {
      let mainContext = arrayOfContexts[0];

      arrayOfContexts.slice(1).forEach(
        (context) => {
          mainContext.attachments = [
            ...mainContext.attachments,
            ...context.attachments
          ];
        }
      )

      actualContexts.push(mainContext);
    }

    return actualContexts.forEach(
      context => this.dispatchMiddleware(context)
    );

    // eslint-cringe-code-linter-disable
  }

  dispatchMiddleware(context) {
    return this.stackMiddleware(context, middlewareIo.noopNext);
  }

  reloadMiddleware() {
    let stack = [...this.stack];

    if (this.hearStack.length !== 0) {
      stack.push(
        middlewareIo.compose([
          ...this.hearStack,
          this.hearFallbackHandler,
        ]),
      );
    }

    this.stackMiddleware = middlewareIo.compose(stack);
  }

  hear(
    hearConditions,
    handler,
  ) {
    let rawConditions = !Array.isArray(hearConditions)
      ? [hearConditions]
      : hearConditions;

    let hasConditions = rawConditions.every(Boolean);

    if (!hasConditions) {
      throw new Error('Condition should be not empty');
    }

    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be a function');
    }

    let textCondition = false;
    let functionCondition = false;

    let conditions = rawConditions.map((condition) => {
      if (typeof condition === 'object' && !(condition instanceof RegExp)) {
        functionCondition = true;

        let entries = Object.entries(condition).map(([path, value]) => (
          [splitPath(path), unifyCondition(value)]
        ));

        return (text, context) => (
          entries.every(([selectors, callback]) => {
            let value = getObjectValue(context, selectors);

            return callback(value, context);
          })
        );
      }

      if (typeof condition === 'function') {
        functionCondition = true;

        return condition;
      }

      textCondition = true;

      if (condition instanceof RegExp) {
        return (text, context) => {
          let passed = condition.test(text);

          if (passed) {
            context.$match = text.match(condition);
          }

          return passed;
        };
      }

      let stringCondition = String(condition);

      return (text) => text === stringCondition;
    });

    let needText = textCondition && functionCondition === false;

    this.hearStack.push((context, next) => {
      let text = context.text || context.caption;

      if (needText && text === null) {
        return next();
      }

      let hasSome = conditions.some((condition) => (
        condition(text, context)
      ));

      return hasSome
        ? handler(context, next)
        : next();
    });

    this.reloadMiddleware();

    return this;
  }

  on(events, handler) {
    if (!Array.isArray(events)) {
      events = [events];
    }

    events = events.filter(Boolean);

    if (events.length === 0) {
      throw new Error('No events found');
    }

    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }

    return this.use((context, next) => context.is(events) ? handler(context, next) : next());
  }
}

module.exports = Updates;
