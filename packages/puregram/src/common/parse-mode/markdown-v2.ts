import { replaceChars } from '../../utils/helpers';

/** Markdown V2 reply markup */
export class MarkdownV2 {
  public static parseMode: 'MarkdownV2' = 'MarkdownV2';

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Bold text */
  public static bold(source: string): string {
    return `*${replaceChars(source, '*')}*`;
  }

  /** Italic text */
  public static italic(source: string): string {
    return `_${replaceChars(source, '_')}_`;
  }

  /** Underlined text */
  public static underline(source: string): string {
    return `__${replaceChars(source, '_')}__`;
  }

  /** Strikethrough text */
  public static strikethrough(source: string): string {
    return `~${replaceChars(source, '~')}~`;
  }

  /** URL with text */
  public static url(source: string, link: string): string {
    return `[${replaceChars(source, ']')}](${replaceChars(link, '\\)')})`;
  }

  /** Mention the user */
  public static mention(source: string, id: number | string): string {
    return `[${replaceChars(source, ']')}](tg://user?id=${id})`;
  }

  /** Preformatted code */
  public static code(source: string): string {
    return `\`${replaceChars(source, '`')}\``;
  }

  /** Preformatted code */
  public static pre(source: string, language?: string): string {
    const quotes = '```';

    return `${quotes}${language || ''}\n${source}\n${quotes}`;
  }
}
