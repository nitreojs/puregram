import { MessageEntity, User } from 'puregram'
import { Hooks } from 'puregram/hooks'
import { TelegramMessageEntityType, TelegramUser } from 'puregram/generated'

import { MarkupItem } from './item'
import { Formatted } from './format'

interface StringLike {
  toString(): string
}

const buildEntities = (index: number, item: MarkupItem): MessageEntity[] => {
  const entities: MessageEntity[] = (
    item.items !== undefined
      ? item.items.flatMap(i => buildEntities(index, i))
      : []
  )

  entities.push(
    new MessageEntity({
      type: item.type,
      offset: item.index || index,
      length: item.text.length,
      ...item.additional
    })
  )

  return entities
}

/**
 * Formats provided text using **entities**, not **formatting mode**. Also supports multiline text.
 *
 * **What's the difference?** When using `parse_mode`, you are obliged to use only certain markup formatting options.
 * The thing is, not every formatting style supports everything. For example, `'Markdown'` does not even support spoilers
 * and entities can not be nested when using it!
 *
 * That's why formatting via entities is generally a good idea. Also, it just looks cool, isn't it?
 *
 * @example
 * context.send(format`${bold('Welcome!')} Feel yourself at home.`)
 * // see? no need to pass that `parse_mode: ...` thing! very cool
 *
 * @example
 * context.send(
 *   format`
 *     ${bold('Welcome!')}
 *     Feel yourself at home.
 *   `
 * )
 */
export function format (rawStrings: TemplateStringsArray, ...rest: (MarkupItem | StringLike)[]) {
  let amountOfSpaces = 0

  const strings = [...rawStrings]

  // format`
  //   foo
  // `
  // strings: [ '\n  foo\n' ]
  if (rawStrings[0].startsWith('\n')) {
    const spacedString = rawStrings[0].split(/^\n+/, 2)[1]

    // '  foo\n'
    if (/^\s/s.test(spacedString)) {
      amountOfSpaces = spacedString.match(/^\s+/)?.[0].length ?? 0
    }
  }

  if (amountOfSpaces > 0) {
    for (let i = 0; i < rawStrings.length; i++) {
      strings[i] = rawStrings[i].replace(new RegExp(`\\n\\s{${amountOfSpaces}}`, 'g'), '\n')
    }
  }

  const response = new Formatted()

  let size = 0

  for (let i = 0; i < strings.length; i++) {
    const string = strings[i]
    const parameter = rest[i]

    const isLast = i >= rest.length || parameter === undefined

    size += string.length

    response.addText(string)

    if (isLast) {
      break
    }

    if (parameter instanceof MarkupItem) {
      // MarkupItem
      response.addText(parameter.text)

      const entities = buildEntities(size, parameter)

      size += parameter.text.length

      response.addEntities(entities)
    } else {
      // StringLike
      const value = parameter.toString()

      size += value.length

      response.addText(value)
    }
  }

  return response
}

type Acceptable = MarkupItem | StringLike

type Tagged = (strings: TemplateStringsArray, ...formatArgs: Acceptable[]) => MarkupItem

type TaggedOrDefault = { (strings: TemplateStringsArray, ...formatArgs: StringLike[]): MarkupItem; (arg: StringLike): MarkupItem }
type NestedTagged<T extends any[]> = { (...keys: T): Tagged; (strings: TemplateStringsArray): MarkupItem }
type TaggedFn<T extends any[]> = ((...keys: T) => Tagged)

// holy fuck this truly is an interesting thing
interface BuildInterface {
  (type: TelegramMessageEntityType): TaggedOrDefault
  <T extends any[]> (type: TelegramMessageEntityType, ...outer: T): undefined extends T[number] ? NestedTagged<T> : TaggedFn<T>
}

function unwrapText <T extends Acceptable[]> (strings: TemplateStringsArray, ...rest: T) {
  return strings.map(
    (string, i) => string + (
      rest[i] instanceof MarkupItem
        ? (rest[i] as MarkupItem).text
        : rest[i] ||
      ''
    )
  ).join('')
}

function join (strings: TemplateStringsArray, ...rest: Acceptable[]) {
  return strings.flatMap((e, i) => [e, rest[i]]).filter(Boolean) as Acceptable[]
}

const build = (<O extends StringLike[] = never>(type: TelegramMessageEntityType, ...outer: O) => {
  // (type: TelegramMessageEntityType): Tagged
  if (outer.length === 0) {
    return <I extends Acceptable[]>(...args: [arg: Acceptable] | [strings: TemplateStringsArray, ...inner: I]): MarkupItem => {
      // (strings: TemplateStringsArray, ...inner: I): MarkupItem
      if (Array.isArray(args[0])) {
        const [strings, ...inner] = args as [strings: TemplateStringsArray, ...inner: I]

        const text = unwrapText(strings, ...inner)
        const innerJoined = join(strings, ...inner)

        let size = 0

        for (const item of innerJoined) {
          if (item instanceof MarkupItem) {
            item.index += size
            size += item.text.length
          } else {
            size += item.toString().length
          }
        }

        return new MarkupItem({
          type,
          text,
          items: inner.filter(e => e instanceof MarkupItem) as MarkupItem[]
        })
      }

      // (arg: MarkupItem): MarkupItem
      if (args[0] instanceof MarkupItem) {
        const item = args[0] as MarkupItem

        return new MarkupItem({ type, text: item.text, items: [item] })
      }

      // (arg: StringLike): MarkupItem
      const text = args[0].toString()

      return new MarkupItem({ type, text })
    }
  }

  // { (...keys: T): Tagged; (strings: TemplateStringsArray): MarkupItem } | ((...keys: T) => Tagged)
  return <I extends StringLike[]>(...args: [...keys: O] | [strings: TemplateStringsArray, ...inner: I]) => {
    // (strings: TemplateStringsArray): MarkupItem
    if (Array.isArray(args[0])) {
      const [strings, ...inner] = args as [strings: TemplateStringsArray, ...inner: I]

      const text = unwrapText(strings, ...inner)

      return new MarkupItem({ type, text })
    }

    // ((...keys: T) => Tagged)
    return (strings: TemplateStringsArray, ...inner: I): MarkupItem => {
      const text = unwrapText(strings, ...inner)

      const additional = outer.reduce(
        (acc, val, i) => ({ ...acc, [val.toString()]: args[i] }),
        {}
      ) as Record<string, any>

      return new MarkupItem({ type, text, additional })
    }
  }
}) as BuildInterface

/** **bold** */
export const bold = build('bold')

/** _italic_ */
export const italic = build('italic')

/** `code` */
export const code = build('code')

/** _underline_ */
export const underline = build('underline')

/** ~~strikethrough~~ */
export const strikethrough = build('strikethrough')

/** _spoiler_ */
export const spoiler = build('spoiler')

/** @mention */
export const mention = build('mention')

/** > blockquote */
export const blockquote = build('blockquote')

export const pre = build<[language?: string]>('pre', 'language')

// @ts-expect-error uhh this should be valid but its not so ok
export const mentionUser = build<[user: TelegramUser | User]>('text_mention', 'user')
export const link = build<[url: string]>('text_link', 'url')
export const customEmoji = build<[id: string]>('custom_emoji', 'custom_emoji_id')

export const hooks: (() => Partial<Hooks>) = () => ({
  onBeforeRequest: [
    (context) => {
      for (const [key, value] of [['text', 'entities'], ['caption', 'caption_entities']]) {
        if (key in context.params && context.params[key] instanceof Formatted) {
          const formatted = context.params[key] as Formatted

          context.params[value] = formatted.text
          context.params[value] = formatted.entities
        }
      }

      return context
    }
  ]
})
