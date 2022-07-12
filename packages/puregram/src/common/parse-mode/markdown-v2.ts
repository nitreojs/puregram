import { replaceChars } from '../../utils/helpers'

const join = (template: TemplateStringsArray, ...args: any[]) => {
  let result = ''

  for (let i = 0; i < template.length; i++) {
    result += MarkdownV2.escape(template[i])

    if (args[i] !== undefined) {
      result += args[i].toString()
    }
  }

  return result
}

/** Markdown V2 parse mode */
export class MarkdownV2 {
  static parseMode: 'MarkdownV2' = 'MarkdownV2'

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /**
   * Since MarkdownV2 requires escaping a lot of chars you can use this static method for easier usage of MarkdownV2 via template strings
   *
   * @example
   * ```js
   * const message = MarkdownV2.build`
   *   foo! bar~ ${MarkdownV2.bold('baz')}
   * `
   * // NOTE: "foo! bar~" part will be automatically escaped!
   * ```
   */
  static build (template: TemplateStringsArray, ...args: any[]) {
    const isMultilineTemplate = template[0][0] === '\n'

    let startSpaces = 0

    if (isMultilineTemplate) {
      const spacesLine = template[0].replace(/\n+/, '')
      const matches = spacesLine.match(/^([\s]+)/g)

      if (matches !== null) {
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

  /** Escape all the danger characters */
  static escape (source: string) {
    return replaceChars(source, ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'])
  }

  /** Bold text */
  static bold (source: string, escape = true) {
    return `*${escape ? MarkdownV2.escape(source) : source}*`
  }

  /** Italic text */
  static italic (source: string, escape = true) {
    return `_${escape ? MarkdownV2.escape(source) : source}_`
  }

  /** Underlined text */
  static underline (source: string, escape = true) {
    return `__${escape ? MarkdownV2.escape(source) : source}__`
  }

  /** Strikethrough text */
  static strikethrough (source: string, escape = true) {
    return `~${escape ? MarkdownV2.escape(source) : source}~`
  }

  /** Spoilered text */
  static spoiler (source: string, escape = true) {
    return `||${escape ? MarkdownV2.escape(source) : source}||`
  }

  /** URL with text */
  static url (source: string, link: string, escape = true) {
    const text = escape ? MarkdownV2.escape(source) : source
    const url = escape ? MarkdownV2.escape(source) : link

    return `[${text}](${url})`
  }

  /** Mention the user */
  static mention (source: string, id: number | string, escape = true) {
    return `[${escape ? MarkdownV2.escape(source) : source}](tg://user?id=${id})`
  }

  /** Preformatted code */
  static code (source: string, escape = true) {
    return `\`${escape ? MarkdownV2.escape(source) : source}\``
  }

  /** Preformatted code */
  static pre (source: string, language?: string, escape = true) {
    const quotes = '```'

    return `${quotes}${language || ''}\n${escape ? MarkdownV2.escape(source) : source}\n${quotes}`
  }
}
