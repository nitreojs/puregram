import { replaceChars } from './escape'

const join = (template: TemplateStringsArray, ...args: unknown[]) => {
  let result = ''

  for (let i = 0; i < template.length; i++) {
    result += MarkdownV2.escape(template[i] ?? '')

    if (args[i] !== undefined) {
      result += String(args[i])
    }
  }

  return result
}

/** markdown V2 parse mode */
export class MarkdownV2 {
  static parseMode = 'MarkdownV2' as const

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /**
   * since MarkdownV2 requires escaping a lot of chars you can use this static
   * method for easier usage of MarkdownV2 via template strings
   *
   * @example
   * ```js
   * const message = MarkdownV2.build`
   *   foo! bar~ ${MarkdownV2.bold('baz')}
   * `
   * // NOTE: "foo! bar~" part will be automatically escaped!
   * ```
   */
  static build (template: TemplateStringsArray, ...args: unknown[]) {
    const first = template[0] ?? ''
    const isMultilineTemplate = first[0] === '\n'

    let startSpaces = 0

    if (isMultilineTemplate) {
      const spacesLine = first.replace(/\n+/, '')
      const matches = spacesLine.match(/^(\s+)/g)

      if (matches?.[0] !== undefined) {
        startSpaces = matches[0].length
      }
    }

    const string = join(template, ...args).trimEnd()
    const lines = string.split(/\n/).slice(1)
    const linesTrimmed = lines.map(
      line => line.startsWith(' '.repeat(startSpaces)) ? line.slice(startSpaces) : line
    )

    return linesTrimmed.join('\n')
  }

  /** @deprecated use `MarkdownV2.escape` instead */
  static raw (source: string) {
    return MarkdownV2.escape(source)
  }

  /** escape all the danger characters */
  static escape (source: string) {
    return replaceChars(source, ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'])
  }

  /** bold text */
  static bold (source: string, escape = true) {
    return `*${escape ? MarkdownV2.escape(source) : source}*`
  }

  /** italic text */
  static italic (source: string, escape = true) {
    return `_${escape ? MarkdownV2.escape(source) : source}_`
  }

  /** underlined text */
  static underline (source: string, escape = true) {
    return `__${escape ? MarkdownV2.escape(source) : source}__`
  }

  /** strikethrough text */
  static strikethrough (source: string, escape = true) {
    return `~${escape ? MarkdownV2.escape(source) : source}~`
  }

  /** spoilered text */
  static spoiler (source: string, escape = true) {
    return `||${escape ? MarkdownV2.escape(source) : source}||`
  }

  /** uRL with text */
  static url (source: string, link: string, escape = true) {
    const text = escape ? MarkdownV2.escape(source) : source
    const url = escape ? MarkdownV2.escape(link) : link

    return `[${text}](${url})`
  }

  /** mention the user */
  static mention (source: string, id: number | string, escape = true) {
    return `[${escape ? MarkdownV2.escape(source) : source}](tg://user?id=${id})`
  }

  /** preformatted code */
  static code (source: string, escape = true) {
    return `\`${escape ? MarkdownV2.escape(source) : source}\``
  }

  /** preformatted code */
  static pre (source: string, language?: string, escape = true) {
    const quotes = '```'

    return `${quotes}${language ?? ''}\n${escape ? MarkdownV2.escape(source) : source}\n${quotes}`
  }

  /** quotation */
  static blockquote (source: string, escape = true) {
    return `>${escape ? MarkdownV2.escape(source) : source}`
  }

  /** custom emoji */
  static emoji (emoji: string, id: string) {
    return `![${emoji}](tg://emoji?id=${id})`
  }
}
