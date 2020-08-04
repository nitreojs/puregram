import { replaceChars } from '../../utils/helpers';

/** Markdown reply markup */
export class Markdown {
  public static parseMode: 'Markdown' = 'Markdown';

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

  /** URL with text */
  public static url(source: string, link: string): string {
    return `[${replaceChars(source, '[]')}](${link})`;
  }

  /** Mention the user */
  public static mention(source: string, id: number | string): string {
    return `[${replaceChars(source, '[]')}](tg://user?id=${id})`;
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
