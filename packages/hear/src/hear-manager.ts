import { Composer, MessageContext } from 'puregram'

import {
  Middleware,
  NextMiddleware,
  skipMiddleware
} from 'middleware-io'

import { HearConditions, ContextMatch } from './types'

import {
  getObjectValue,
  unifyCondition,
  splitPath
} from './helpers'

export class HearManager<C extends MessageContext> {
  private composer = Composer.builder<C & ContextMatch>()
  private fallbackHandler: Middleware<C & ContextMatch> = skipMiddleware
  private composed!: Middleware<C & ContextMatch>

  constructor() {
    this.recompose()
  }

  get length() {
    return this.composer.length
  }

  get middleware(): Middleware<C & ContextMatch> {
    return (context: C & ContextMatch, next: NextMiddleware) => this.composed(context, next)
  }

  hear(
    hearConditions: HearConditions<C & ContextMatch>,
    handler: Middleware<C & ContextMatch>
  ) {
    const rawConditions = !Array.isArray(hearConditions)
      ? [hearConditions]
      : hearConditions

    const hasConditions = rawConditions.every(Boolean)

    if (!hasConditions) {
      throw new Error('condition should be not empty')
    }

    if (typeof handler !== 'function') {
      throw new TypeError('handler must be a function')
    }

    let textCondition = false
    let functionCondition = false

    const conditions = rawConditions.map(
      (condition) => {
        if (typeof condition === 'object' && !(condition instanceof RegExp)) {
          functionCondition = true

          const entries = Object.entries(condition)
            .map(([path, value]): [string[], Function] => [splitPath(path), unifyCondition(value)])

          return (text: string | undefined, context: C) => (
            entries.every(([selectors, callback]) => {
              const value = getObjectValue(context, selectors)

              return callback(value, context)
            })
          )
        }

        if (typeof condition === 'function') {
          functionCondition = true

          return condition
        }

        textCondition = true

        if (condition instanceof RegExp) {
          return (text: string | undefined, context: C & ContextMatch) => {
            const passed = condition.test(text!)

            if (passed) {
              context.$match = text!.match(condition)!
            }

            return passed
          }
        }

        const stringCondition = String(condition)

        return (text: string | undefined) => text === stringCondition
      }
    )

    const needText = textCondition && !functionCondition

    this.composer.use(
      (context: C & ContextMatch, next: NextMiddleware) => {
        if (needText && !context.hasText && !context.hasCaption) {
          return next()
        }

        const text = context.text ?? context.caption!

        const hasSome = conditions.some(condition => condition(text, context))

        return hasSome
          ? handler(context, next)
          : next()
      }
    )

    this.recompose()

    return this
  }

  command(command: string, handler: Middleware<C>) {
    if (!command) {
      throw new Error('command should not be empty')
    }

    if (typeof handler !== 'function') {
      throw new TypeError('handler must be a function')
    }

    this.composer.use(
      (context: C, next: NextMiddleware) => {
        if (!context.hasText && !context.hasCaption) {
          return next()
        }

        const text = context.text ?? context.caption!

        const firstWord = text.split(/\s/)[0]

        // INFO: starts with a '/' followed by a bunch of symbols (might have '@' and a bunch of symbols ending with 'bot')
        // INFO: /foo_bar@username_bot
        if (/^\/\w+(?:@\w+bot)?/.test(firstWord)) {
          // INFO: 't' for 'text'
          const [tCommandRaw, tUsername] = firstWord.split('@')

          const hasUsername = tUsername !== undefined
          const contextHasBotInfo = context.telegram.bot?.username !== undefined

          // INFO: we have '@<username>' part but we don't have info about our bot
          if (hasUsername && !contextHasBotInfo) {
            return next()
          }

          // INFO: we have '@<username>' part but usernames do not match
          if (hasUsername && tUsername.toLowerCase() !== context.telegram.bot.username!.toLowerCase()) {
            return next()
          }

          // INFO: since command starts with '/' and we don't have that in [command] we need to slice that
          const tCommand = tCommandRaw.slice(1)

          if (tCommand !== command) {
            return next()
          }

          return handler(context, next)
        }
      }
    )

    this.recompose()

    return this
  }

  /** A handler that is called when handlers are not found */
  onFallback(handler: Middleware<C>) {
    this.fallbackHandler = handler

    this.recompose()

    return this
  }

  private recompose() {
    this.composed = this.composer.clone()
      .use(this.fallbackHandler)
      .compose()
  }
}
