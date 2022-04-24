import { replaceChars } from '../../utils/helpers'

/** Markdown V2 reply markup */
export class MarkdownV2 {
  static parseMode: 'MarkdownV2' = 'MarkdownV2'

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** Escape all the danger characters */
  static raw(source: string): string {
    return replaceChars(source, ['*', '_', '~', '[', ']', '`'])
  }

  /** Bold text */
  static bold(source: string): string {
    return `*${replaceChars(source, '*')}*`
  }

  /** Italic text */
  static italic(source: string): string {
    return `_${replaceChars(source, '_')}_`
  }

  /** Underlined text */
  static underline(source: string): string {
    return `__${replaceChars(source, '_')}__`
  }

  /** Strikethrough text */
  static strikethrough(source: string): string {
    return `~${replaceChars(source, '~')}~`
  }

  /** Spoilered text */
  static spoiler(source: string): string {
    return `||${source.replace(/\|/g, '\\|')}||`
  }

  /** URL with text */
  static url(source: string, link: string): string {
    return `[${replaceChars(source, ']')}](${replaceChars(link, '\\)')})`
  }

  /** Mention the user */
  static mention(source: string, id: number | string): string {
    return `[${replaceChars(source, ']')}](tg://user?id=${id})`
  }

  /** Preformatted code */
  static code(source: string): string {
    return `\`${replaceChars(source, '`')}\``
  }

  /** Preformatted code */
  static pre(source: string, language?: string): string {
    const quotes = '```'

    return `${quotes}${language || ''}\n${source}\n${quotes}`
  }
}
