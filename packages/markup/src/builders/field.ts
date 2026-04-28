import { type Entity, Formatted } from '../formatted'

interface UserLike {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
}

function single (text: string, entity: Entity) {
  return new Formatted(text, [entity])
}

/** wraps text in a `text_link` entity pointing at `url` */
export function link (text: string, url: string) {
  return single(text, { type: 'text_link', offset: 0, length: text.length, url })
}

/** wraps text in a `text_mention` entity carrying the full `user` object */
export function textMention (text: string, user: UserLike) {
  return single(text, { type: 'text_mention', offset: 0, length: text.length, user })
}

/** wraps text in a `custom_emoji` entity referencing `customEmojiId` */
export function customEmoji (text: string, customEmojiId: string) {
  return single(text, { type: 'custom_emoji', offset: 0, length: text.length, custom_emoji_id: customEmojiId })
}

/** wraps text in a `pre` entity, optionally with a syntax-highlighting `language` */
export function pre (text: string, language?: string): Formatted {
  const entity: Entity = { type: 'pre', offset: 0, length: text.length }

  if (language !== undefined) {
    entity.language = language
  }

  return single(text, entity)
}

/** mentions a user by id; synthesises a minimal user with `first_name = text` */
export function mentionUser (text: string, id: number) {
  return textMention(text, { id, first_name: text, is_bot: false })
}

/** mentions a bot by id; synthesises a minimal user with `is_bot: true` */
export function mentionBot (text: string, id: number) {
  return textMention(text, { id, first_name: text, is_bot: true })
}
