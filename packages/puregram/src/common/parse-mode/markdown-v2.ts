import { replaceChars } from '../../utils/helpers'

/** Markdown V2 parse mode */
export class MarkdownV2 {
  static parseMode: 'MarkdownV2' = 'MarkdownV2'

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** @deprecated use `MarkdownV2.escape` instead */
  static raw(source: string) {
    return MarkdownV2.escape(source)
  }

  /** Escape all the danger characters */
  static escape(source: string) {
    return replaceChars(source, ['*', '_', '~', '[', ']', '`'])
  }

  /** Bold text */
  static bold(source: string, escape: boolean = true) {
    return `*${escape ? replaceChars(source, '*') : source}*`
  }

  /** Italic text */
  static italic(source: string, escape: boolean = true) {
    return `_${escape ? replaceChars(source, '_') : source}_`
  }

  /** Underlined text */
  static underline(source: string, escape: boolean = true) {
    return `__${escape ? replaceChars(source, '_') : source}__`
  }

  /** Strikethrough text */
  static strikethrough(source: string, escape: boolean = true) {
    return `~${escape ? replaceChars(source, '~') : source}~`
  }

  /** Spoilered text */
  static spoiler(source: string, escape: boolean = true) {
    return `||${escape ? source.replace(/\|/g, '\\|') : source}||`
  }

  /** URL with text */
  static url(source: string, link: string, escape: boolean = true) {
    const text = escape ? replaceChars(source, ']') : source
    const url = escape ? replaceChars(link, '\\)') : link

    return `[${text}](${url})`
  }

  /** Mention the user */
  static mention(source: string, id: number | string, escape: boolean = true) {
    return `[${escape ? replaceChars(source, ']') : source}](tg://user?id=${id})`
  }

  /** Preformatted code */
  static code(source: string, escape: boolean = true) {
    return `\`${escape ? replaceChars(source, '`') : source}\``
  }

  /** Preformatted code */
  static pre(source: string, language?: string) {
    const quotes = '```'

    return `${quotes}${language || ''}\n${source}\n${quotes}`
  }
}
