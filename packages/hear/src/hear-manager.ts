import { Context, Composer } from 'puregram'

import {
  Middleware,
  MiddlewareReturn,
  NextMiddleware,
  skipMiddleware
} from 'middleware-io'

import { HearConditions } from './types'

import {
  getObjectValue,
  unifyCondition,
  splitPath
} from './helpers'

export class HearManager<C extends Context> {
  private composer = Composer.builder<C>();

  private fallbackHandler: Middleware<C> = skipMiddleware;

  private composed!: Middleware<C>

  constructor() {
    this.recompose()
  }

  public get length(): number {
    return this.composer.length
  }

  public get middleware(): Middleware<C> {
    return (context: C, next: NextMiddleware): unknown => (
      this.composed(context, next)
    )
  }

  public hear<T = {}>(
    hearConditions: HearConditions<C & T>,
    handler: Middleware<C & T>
  ): this {
    const rawConditions = !Array.isArray(hearConditions)
      ? [hearConditions]
      : hearConditions

    const hasConditions = rawConditions.every(Boolean)

    if (!hasConditions) {
      throw new Error('Condition should be not empty')
    }

    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be a function')
    }

    let textCondition = false
    let functionCondition = false

    const conditions = rawConditions.map(
      (condition): Function => {
        if (typeof condition === 'object' && !(condition instanceof RegExp)) {
          functionCondition = true

          const entries = Object.entries(condition)
            .map(
              ([path, value]): [string[], Function] => (
                [splitPath(path), unifyCondition(value)]
              )
            )

          return (text: string | undefined, context: C): boolean => (
            entries.every(
              ([selectors, callback]: [string[], Function]): boolean => {
                const value: any = getObjectValue(context, selectors)

                return callback(value, context)
              }
            )
          )
        }

        if (typeof condition === 'function') {
          functionCondition = true

          return condition
        }

        textCondition = true

        if (condition instanceof RegExp) {
          return (text: string | undefined, context: C): boolean => {
            const passed: boolean = condition.test(text!)

            // @ts-expect-error
            if (passed) context.$match = text!.match(condition)!

            return passed
          }
        }

        const stringCondition: string = String(condition)

        return (text: string | undefined): boolean => (
          text === stringCondition
        )
      }
    )

    const needText = textCondition && !functionCondition

    this.composer.use(
      (context: C & T, next: NextMiddleware): MiddlewareReturn => {
        // @ts-expect-error
        const { text, caption } = context

        if (needText && text === undefined && caption === undefined) {
          return next()
        }

        const hasSome = conditions.some(
          (condition: Function): boolean => (
            condition(text ?? caption, context)
          )
        )

        return hasSome
          ? handler(context, next)
          : next()
      }
    )

    this.recompose()

    return this
  }

  /** A handler that is called when handlers are not found */
  public onFallback(handler: Middleware<C>): this {
    // @ts-ignore
    this.fallbackHandler = handler

    this.recompose()

    return this
  }

  private recompose(): void {
    this.composed = this.composer.clone()
      .use(this.fallbackHandler)
      .compose()
  }
}
