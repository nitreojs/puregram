import { Context, Composer } from 'puregram'

import {
  Middleware,
  MiddlewareReturn,
  NextMiddleware,
  skipMiddleware
} from 'middleware-io'

import { HearConditions, ContextMatch } from './types'

import {
  getObjectValue,
  unifyCondition,
  splitPath
} from './helpers'

export class HearManager<C extends Context> {
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
    this.hear(/^\/start/i, (context) => { })

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
      (context: C & ContextMatch, next: NextMiddleware): MiddlewareReturn => {
        // @ts-expect-error
        const { text, caption } = context

        if (needText && text === undefined && caption === undefined) {
          return next()
        }

        const hasSome = conditions.some(condition => condition(text ?? caption, context))

        return hasSome
          ? handler(context, next)
          : next()
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
