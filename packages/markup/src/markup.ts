import { MessageEntity } from 'puregram'
import { Hooks } from 'puregram/hooks'
import { AnswerInlineQueryParams, TelegramUser, TelegramMessageEntityType } from 'puregram/generated'

import { Formatted } from './format'

interface Entity {
  type: TelegramMessageEntityType
  offset: number
  length: number

  url?: string // text_link
  user?: TelegramUser // text_mention
  language?: string // pre
  custom_emoji_id?: string // custom_emoji
}

interface MarkupRepresentativeOptions {
  text: string
  entities: Entity[]
}

class MarkupRepresentative {
  constructor (private options: MarkupRepresentativeOptions) {}

  get text () {
    return this.options.text
  }

  get entities () {
    return this.options.entities
  }
}

interface StringLike {
  toString(): string
}

type Rest = (StringLike | MarkupRepresentative)[]

function process (parts: string[] | TemplateStringsArray, ...rest: Rest) {
  let result = parts[0]
  let offset = result.length

  const entities: Entity[] = []

  for (let i = 0; i < rest.length; i++) {
    const frame = parts[i + 1]
    const arg = rest[i]

    if (arg instanceof MarkupRepresentative) {
      for (const entity of arg.entities) {
        entity.offset += offset
      }

      const addition = arg.text + frame

      result += addition
      offset += addition.length

      entities.push(...arg.entities)
    } else {
      const addition = arg + frame

      result += addition
      offset += addition.length
    }
  }

  return { text: result, entities }
}

const constructMarkup = (type: TelegramMessageEntityType, strings: TemplateStringsArray, ...rest: Rest) => {
  const { text, entities } = process(strings, ...rest)

  return new MarkupRepresentative({
    text,
    entities: [
      {
        type,
        offset: 0,
        length: text.length
      },
      ...entities
    ]
  })
}

interface MarkupElement {
  // bold('hello!')
  (text: string): MarkupRepresentative
  // bold(italic('hello!'))
  (markup: MarkupRepresentative): MarkupRepresentative
  // bold`hello ${italic('world')}!`
  (strings: TemplateStringsArray, ...rest: Rest): MarkupRepresentative
}

interface MarkupRequiredElement<Fields extends string[]> {
  // link('hello!', 'https://example.com')
  (text: string, ...fields: Fields): MarkupRepresentative
}

const build = (type: TelegramMessageEntityType) => (
  (...args: [markup: MarkupRepresentative] | [text: string] | [strings: TemplateStringsArray, ...rest: Rest]) => {
    if (typeof args[0] === 'string') {
      const text = args[0]

      return new MarkupRepresentative({
        text,
        entities: [
          {
            type,
            offset: 0,
            length: text.length
          }
        ]
      })
    }

    // bold(italic('hello'))
    if (args[0] instanceof MarkupRepresentative) {
      const markup = args[0]

      return new MarkupRepresentative({
        text: markup.text,
        entities: [
          {
            type,
            offset: 0,
            length: markup.text.length
          },
          ...markup.entities
        ]
      })
    }

    // bold`hello ${italic('world')}!`
    const [strings, ...rest] = args

    return constructMarkup(type, strings, ...rest)
  }
) as MarkupElement

const buildWithField = <Field extends string[]>(type: TelegramMessageEntityType, ...outer: Field) => (
  (text: string, ...fields: Field) => {
    const key = outer[0]
    const value = fields[0]

    return new MarkupRepresentative({
      text,
      entities: [
        {
          type,
          [key]: value,
          offset: 0,
          length: text.length
        }
      ]
    })
  }
) as MarkupRequiredElement<Field>

/** **bold** */
export const bold = build('bold')
/** _italic_ */
export const italic = build('italic')
/** underline */
export const underline = build('underline')
/** ~strikethrough~ */
export const strikethrough = build('strikethrough')
/** spoiler */
export const spoiler = build('spoiler')
/** > blockquote */
export const blockquote = build('blockquote')
/** > quote */
export const quote = build('blockquote')
/** `code` */
export const code = build('code')

/**
 * Mentions a user
 *
 * @example
 * context.send(format`This is a ${textMention('mention', { id: 1337, is_bot: false, first_name: '😎' })}.`)
 */
// @ts-expect-error i dont know how to fix this but this is ok trust me
export const textMention = buildWithField<[user: User]>('text_mention', 'user')

/**
 * Links a text to a URL
 *
 * @example
 * context.send(format`This is a ${link('link', 'https://example.com')}.`)
 */
export const link = buildWithField<[url: string]>('text_link', 'url')

/**
 * Renders a custom emoji by its ID
 *
 * @example
 * context.send(format`This is a ${customEmoji('😎', CUSTOM_EMOJI_ID)}. Very cool.`)
 */
export const customEmoji = buildWithField<[id: string]>('custom_emoji', 'custom_emoji_id')

/**
 * Mentions a user via `text_mention` entity
 *
 * @example
 * context.send(format`This text will mention ${mentionUser('starkow', 398859857)} like it's a username.`)
 */
export const mentionUser = (text: string, id: number) => textMention(text, { id, first_name: text, is_bot: false })

/**
 * Mentions a bot via `text_mention` entity
 *
 * @example
 * context.send(format`This text will mention ${mentionBot('me', telegram.bot.id)} like it's a username.`)
 */
export const mentionBot = (text: string, id: number) => textMention(text, { id, first_name: text, is_bot: true })

/**
 * Renders a pre-formatted text, optionally with a language
 *
 * @example
 * context.send(format`This is a ${pre('pre-formatted text')}.`)
 * context.send(format`This is a ${pre('pre-formatted JS code', 'js')}.`)
 */
// @ts-expect-error i dont know how to fix this but this is ok trust me
export const pre = buildWithField<[language?: string]>('pre', 'language')

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
export function format (strings: TemplateStringsArray, ...rest: Rest) {
  const parts = [...strings]

  if (strings[0].startsWith('\n')) {
    const spaces = (strings[0].match(/\n([ \t]*)/)?.[1] ?? '').length
    const re = new RegExp(`\\n[ \t]{${spaces}}`, 'g')

    for (let i = 0; i < parts.length; i++) {
      parts[i] = parts[i].replace(re, '\n')
    }
  }

  const { text, entities } = process(parts, ...rest)

  return new Formatted(text, entities.map(e => new MessageEntity(e)))
}

/**
 * The same as `format`, but this one strips all the leading spaces, not just the first group of spaces.
 *
 * @example
 * context.send(
 *   format`
 *     ${bold('Welcome!')}
 *       This is a staircase.
 *         It will be preserved by \`format\`.
 *   `
 * )
 *
 * context.send(
 *   formatDedent`
 *     ${bold('Welcome!')}
 *       This is not a staircase anymore.
 *         \`formatDedent\` will strip all the leading spaces.
 *   `
 * )
 */
export function formatDedent (strings: TemplateStringsArray, ...rest: Rest) {
  const parts = [...strings]

  if (strings[0].startsWith('\n')) {
    for (let i = 0; i < parts.length; i++) {
      parts[i] = parts[i].replace(/\n[ \t]+/g, '\n')
    }
  }

  const { text, entities } = process(parts, ...rest)

  return new Formatted(text, entities.map(e => new MessageEntity(e)))
}

function processEntity (entity: Record<string, any>) {
  for (const [key, value] of [['text', 'entities'], ['caption', 'caption_entities'], ['quote', 'quote_entities']]) {
    if (key in entity && entity[key] instanceof Formatted) {
      const fmt = entity[key] as Formatted

      entity[key] = fmt.format()
      entity[value] = fmt.entities
    }
  }
}

// TODO: refactor
function processParams (path: string, params: Record<string, any>) {
  if (path === 'sendMediaGroup') {
    for (const entity of params.media) {
      processEntity(entity)
    }
  } else {
    processEntity(params)
  }

  if ('reply_parameters' in params && 'quote' in params.reply_parameters) {
    processEntity(params.reply_parameters)
  }

  if (path === 'answerInlineQuery') {
    const iqp = params as AnswerInlineQueryParams
    const results = iqp.results

    const isResultFormatted = (result: AnswerInlineQueryParams['results'][number]) => (
      'input_message_content' in result &&
      result.input_message_content.message_text instanceof Formatted
    )

    for (let i = 0; i < results.length; i++) {
      if (isResultFormatted(results[i])) {
        const result = results[i]
        const fmt = result.input_message_content.message_text as Formatted

        result.input_message_content.message_text = fmt.text
        result.input_message_content.entities = fmt.entities
      }
    }
  }

  return params
}

export const hooks: (() => Partial<Hooks>) = () => ({
  onBeforeRequest: [
    (context) => {
      context.params = processParams(context.path, context.params)

      return context
    }
  ]
})
