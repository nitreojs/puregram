interface IPreParams {
  /**
   * Code's programming language
   */
  language?: string;

  /**
   * The code to format
   */
  code: string;
}

declare class Markdown {
  public [Symbol.toStringTag](): 'Markdown';

  /**
   * Format text into bold
   */
  public static bold(text: string): string;
  
  /**
   * Format text into italic
   */
  public static italic(text: string): string;

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
  public static pre(params: IPreParams): string;

  public static get parseMode(): 'Markdown';
}

export = Markdown;
