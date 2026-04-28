import { type Entity, Formatted } from '../formatted'

import { makeWrap, type WrapFn } from './wrap'

interface UserLike {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
}

/** wraps text in a `text_link` entity pointing at `url`. legacy `link(text, url)` or curried `link(url)` */
export function link (text: string, url: string): Formatted
export function link (url: string): WrapFn
export function link (...args: unknown[]): Formatted | WrapFn {
  if (args.length === 2 && typeof args[0] === 'string' && typeof args[1] === 'string') {
    const text = args[0]
    const url = args[1]

    return new Formatted(text, [{ type: 'text_link', offset: 0, length: text.length, url }])
  }

  if (args.length === 1 && typeof args[0] === 'string') {
    const url = args[0]

    return makeWrap(text => ({ type: 'text_link', offset: 0, length: text.length, url }))
  }

  throw new TypeError('link expected (text, url) or (url)')
}

/** wraps text in a `text_mention` entity carrying the full `user` object. dual-form */
export function textMention (text: string, user: UserLike): Formatted
export function textMention (user: UserLike): WrapFn
export function textMention (...args: unknown[]): Formatted | WrapFn {
  if (args.length === 2 && typeof args[0] === 'string' && isObject(args[1])) {
    const text = args[0]
    const user = args[1] as UserLike

    return new Formatted(text, [{ type: 'text_mention', offset: 0, length: text.length, user }])
  }

  if (args.length === 1 && isObject(args[0])) {
    const user = args[0] as UserLike

    return makeWrap(text => ({ type: 'text_mention', offset: 0, length: text.length, user }))
  }

  throw new TypeError('textMention expected (text, user) or (user)')
}

/** wraps text in a `custom_emoji` entity referencing `customEmojiId`. dual-form */
export function customEmoji (text: string, customEmojiId: string): Formatted
export function customEmoji (customEmojiId: string): WrapFn
export function customEmoji (...args: unknown[]): Formatted | WrapFn {
  if (args.length === 2 && typeof args[0] === 'string' && typeof args[1] === 'string') {
    const text = args[0]
    const id = args[1]

    return new Formatted(text, [{ type: 'custom_emoji', offset: 0, length: text.length, custom_emoji_id: id }])
  }

  if (args.length === 1 && typeof args[0] === 'string') {
    const id = args[0]

    return makeWrap(text => ({ type: 'custom_emoji', offset: 0, length: text.length, custom_emoji_id: id }))
  }

  throw new TypeError('customEmoji expected (text, customEmojiId) or (customEmojiId)')
}

/**
 * wraps text in a `pre` entity, optionally with a syntax-highlighting `language`.
 * dual-form: legacy `pre(text)`/`pre(text, language)` (eager) or curried `pre()(text)` (no lang).
 * for with-lang use legacy 2-arg `pre('code', 'js')` — curried-with-lang is intentionally not supported
 */
export function pre (text: string, language?: string): Formatted
export function pre (formatted: Formatted | { text: string, entities?: readonly Entity[] }): Formatted
export function pre (strings: TemplateStringsArray, ...rest: readonly unknown[]): Formatted
export function pre (): WrapFn
export function pre (...args: unknown[]): Formatted | WrapFn {
  if (args.length === 0) {
    return makeWrap(text => ({ type: 'pre', offset: 0, length: text.length }))
  }

  if (args.length === 2 && typeof args[0] === 'string' && typeof args[1] === 'string') {
    const text = args[0]
    const language = args[1]

    return new Formatted(text, [{ type: 'pre', offset: 0, length: text.length, language }])
  }

  // single-arg eager paths reuse the curried wrapper to handle string/Formatted/template uniformly
  return makeWrap(text => ({ type: 'pre', offset: 0, length: text.length }))(...(args as Parameters<WrapFn>))
}

/** mentions a user by id; synthesises a minimal user with `first_name = text`. dual-form */
export function mentionUser (text: string, id: number): Formatted
export function mentionUser (id: number): WrapFn
export function mentionUser (...args: unknown[]): Formatted | WrapFn {
  if (args.length === 2 && typeof args[0] === 'string' && typeof args[1] === 'number') {
    const text = args[0]
    const id = args[1]

    return new Formatted(text, [{
      type: 'text_mention',
      offset: 0,
      length: text.length,
      user: { id, first_name: text, is_bot: false }
    }])
  }

  if (args.length === 1 && typeof args[0] === 'number') {
    const id = args[0]

    return makeWrap(text => ({
      type: 'text_mention',
      offset: 0,
      length: text.length,
      user: { id, first_name: text, is_bot: false }
    }))
  }

  throw new TypeError('mentionUser expected (text, id) or (id)')
}

/** mentions a bot by id; synthesises a minimal user with `is_bot: true`. dual-form */
export function mentionBot (text: string, id: number): Formatted
export function mentionBot (id: number): WrapFn
export function mentionBot (...args: unknown[]): Formatted | WrapFn {
  if (args.length === 2 && typeof args[0] === 'string' && typeof args[1] === 'number') {
    const text = args[0]
    const id = args[1]

    return new Formatted(text, [{
      type: 'text_mention',
      offset: 0,
      length: text.length,
      user: { id, first_name: text, is_bot: true }
    }])
  }

  if (args.length === 1 && typeof args[0] === 'number') {
    const id = args[0]

    return makeWrap(text => ({
      type: 'text_mention',
      offset: 0,
      length: text.length,
      user: { id, first_name: text, is_bot: true }
    }))
  }

  throw new TypeError('mentionBot expected (text, id) or (id)')
}

function isObject (value: unknown) {
  return typeof value === 'object' && value !== null
}
