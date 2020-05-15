declare class HTML {
  public [Symbol.toStringTag](): 'HTML';

  /**
   * Format text into bold
   */
  public static bold(text: string): string;

  /**
   * Format text into italic
   */
  public static italic(text: string): string;

  /**
   * Format text into underlined
   */
  public static underline(text: string): string;

  /**
   * Strike the text
   */
  public static strikethrough(text: string): string;

  /**
   * Format text into URL
   */
  public static url(text: string, link: string): string;

  /**
   * Format text into user's mention
   */
  public static mention(text: string, id: string | number): string;

  /**
   * Format text into preformatted code
   */
  public static code(text: string): string;

  /**
   * Format text into preformatted text
   */
  public static pre(code: string): string;

  public static get parseMode(): 'HTML';
}

export = HTML;
