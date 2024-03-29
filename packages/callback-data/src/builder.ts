import { createHash } from 'node:crypto'

import type { Middleware, NextMiddleware } from 'puregram'
import type { CallbackQueryContext, Context } from 'puregram/contexts'

import type { Accepted, CallbackLayer, ConditionalObject, Simplify, ValidateConditions, WrongPayloadHandler } from './types'

// charset must consist of 2^7-1 characters
const CHARSET = [...Array(128).keys()].map(i => String.fromCharCode(i))

type FieldType = 'string' | 'number' | 'boolean'

type DetermineStateKey<T, Key extends string, Options> =
  Options extends ({ optional: true } | { default: T })
    ? { [P in Key]?: T }
    : { [P in Key]: T }

interface FieldOptions<Initial extends Accepted> {
  optional?: boolean
  default?: Initial
}

interface FieldSettings {
  type: FieldType
  optional?: boolean
  default?: Accepted
}

/**
 * A simple callback data builder with simple validation and type safety
 *
 * @example
 * // ... somewhere separately exported for later use
 * export const BanPayload = CallbackDataBuilder.create('ban')
 *   .number('user_id')
 *
 * // ... later in code
 *
 * const keyboard = InlineKeyboard.keyboard([
 *   InlineKeyboard.textButton({
 *     text: 'Ban!',
 *     payload: BanPayload.pack({ user_id: context.senderId })
 *   })
 * ])
 *
 * // ... in the updates handler
 *
 * telegram.updates.use(
 *   BanPayload.handle((context) => {
 *     const payload = context.unpackedPayload
 *     //    payload: { user_id: number }  <- type-safe!
 *
 *     // your logic here
 *   })
 * )
 */
export class CallbackDataBuilder<State extends Record<string, any> = Record<never, never>> {
  public slug: string

  private fields: [string, FieldSettings][] = []
  private filters: ConditionalObject<State>[] = []

  constructor (slug: string) {
    // base64(md5(slug)).slice(0, 6)
    this.slug = createHash('md5').update(slug).digest('base64').slice(0, 6)
  }

  /** A simple `CallbackDataBuilder` factory */
  static create (slug: string) {
    return new CallbackDataBuilder(slug)
  }

  /** Adds a string field to the payload */
  string<Key extends string, Options extends FieldOptions<string>> (key: Key, options?: Options):
    CallbackDataBuilder<Simplify<State & DetermineStateKey<string, Key, Options>>> {
    this.fields.push([key, {
      type: 'string',
      ...options
    }])

    return this
  }

  /** Adds a number field to the payload */
  number<Key extends string, Options extends FieldOptions<number>> (key: Key, options?: Options):
    CallbackDataBuilder<Simplify<State & DetermineStateKey<number, Key, Options>>> {
    this.fields.push([key, {
      type: 'number',
      ...options
    }])

    return this
  }

  /** Adds a boolean field to the payload */
  boolean<Key extends string, Options extends FieldOptions<boolean>> (key: Key, options?: Options):
    CallbackDataBuilder<Simplify<State & DetermineStateKey<boolean, Key, Options>>> {
    this.fields.push([key, {
      type: 'boolean',
      ...options
    }])

    return this
  }

  clone (): CallbackDataBuilder<State> {
    const clone = new CallbackDataBuilder(this.slug)

    clone.slug = this.slug
    clone.fields = [...this.fields]
    clone.filters = [...this.filters]

    return clone as CallbackDataBuilder<State>
  }

  /** Packs this callback data into a string */
  pack (params: State): string {
    let skipped = false

    const parts: string[] = []

    for (const [key, settings] of this.fields) {
      if (!skipped && !(key in params) && settings.default === undefined) {
        skipped = true

        continue
      }

      if (settings.optional && !(key in params)) {
        skipped = true

        continue
      }

      const flag = Number(skipped) << 6

      let value: string = (params[key] ?? settings.default).toString()

      if (settings.type === 'boolean') {
        value = value === 'true' ? 't' : 'f'
      }

      const length = value.toString().length

      const code = length | flag
      const fieldIndex = flag !== 0 ? (parts.length + 1).toString() : ''

      const prefixChar = CHARSET[code]

      parts.push(prefixChar + fieldIndex + value)
    }

    const result = this.slug + parts.join('')

    return result
  }

  /** Unpacks a string into a callback data object */
  unpack (data: string): State {
    const fields: [string, Accepted][] = []

    // check if the value matches the slug
    if (data.slice(0, 6) !== this.slug) {
      return { _$: 'wrong' } as unknown as State
    }

    let offset = 6

    while (offset < data.length) {
      const shifted = data.slice(offset)

      // extract the raw length of the field from the first character
      const rawLength = CHARSET.indexOf(shifted[0])

      // extract the flag and length from the raw length value
      const flag = rawLength & (1 << 6)
      const length = rawLength & 63

      // extract the field index if the flag is set
      const fieldIndex = flag !== 0 ? Number.parseInt(shifted.slice(1, 2)) : undefined

      // calculate the start index to extract the value from the shifted string
      const shiftIndexStart = flag !== 0 ? 2 : 1

      // extract the value from the shifted string using the length and start index
      let value: Accepted = shifted.slice(shiftIndexStart, length + shiftIndexStart)

      offset += 1 + Number(fieldIndex !== undefined) + length

      // get the field and its settings based on the field index
      const field = this.fields[fieldIndex ?? fields.length]
      const settings = field[1]

      // check the type of the field and parse the value accordingly
      if (settings.type === 'boolean') {
        value = value === 't'
      } else if (settings.type === 'number') {
        value = Number.parseFloat(value)
      } // else type === 'string'

      // push the field and its value to the fields array
      fields.push([field[0], value])
    }

    // convert the fields array to an object and return it
    return Object.fromEntries(fields) as State
  }

  private isWrongPayload (p: State | WrongPayloadHandler): p is WrongPayloadHandler {
    return p._$ === 'wrong'
  }

  private evaluate (value: unknown, parsedValue: unknown): boolean {
    // Initial
    if (typeof value === typeof parsedValue) {
      return value === parsedValue
    }

    // (value: Initial) => Initial | boolean
    if (typeof value === 'function') {
      const evaluated: Accepted = value(parsedValue)

      if (typeof evaluated === typeof parsedValue) {
        return evaluated === parsedValue
      }

      return evaluated !== false
    }

    // AllowedConditionValue<Initial>[]
    if (Array.isArray(value)) {
      const conditions = value.map(v => this.evaluate(v, parsedValue))

      return conditions.some(v => v !== false)
    }

    throw new Error('invalid value passed')
  }

  private filtersPass (filters: ConditionalObject<State>[], parsed: State) {
    for (const filter of filters) {
      for (const [key, value] of Object.entries(filter)) {
        const passed = this.evaluate(value, parsed[key])

        if (!passed) {
          return false
        }
      }
    }

    return true
  }

  /** Returns `true` if the provided `data` may be used to unpack this payload */
  validate (data: string) {
    try {
      const unpacked: State | WrongPayloadHandler = this.unpack(data)

      if (this.isWrongPayload(unpacked)) {
        return false
      }

      if (!this.filtersPass(this.filters, unpacked)) {
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }

  filter<Conditions extends ConditionalObject<State>> (conditions: Conditions) {
    this.filters.push(conditions)

    return this as CallbackDataBuilder<Simplify<State & ValidateConditions<Conditions>>>
  }

  handle (fn: Middleware<CallbackQueryContext & CallbackLayer<State>>): Middleware<Context> {
    // what you gonna do with me after this huh?
    const filters = [...this.filters]

    this.filters = []

    return (context: Context, next: NextMiddleware) => {
      if (!context.is('callback_query')) {
        return next()
      }

      if (!context.hasQueryPayload()) {
        return next()
      }

      const payload = context.queryPayload

      if (typeof payload !== 'string') {
        return next()
      }

      try {
        const parsed = this.unpack(payload) as State | WrongPayloadHandler

        if (this.isWrongPayload(parsed)) {
          return next()
        }

        if (!this.filtersPass(filters, parsed)) {
          return next()
        }

        context.unpackedPayload = parsed

        return fn(context as CallbackQueryContext & CallbackLayer<State>, next)
      } catch (error) {
        console.error(error)
      }
    }
  }
}

// hey you! you are the best!
//
// {\ _ /}
// ( • - •)
// / > ❤️
