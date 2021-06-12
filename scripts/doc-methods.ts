/**
 * ```ts
 * camelizeFirst('fooBar')
 * // FooBar
 * ```
 */
export const camelizeFirst = (source: string): string => (
  source[0].toUpperCase() + source.slice(1)
);

/**
 * ```ts
 * camelize('foo-bar')
 * // FooBar
 *
 * camelize('foo bar-baz')
 * // FooBarBaz
 * ```
 */
export const camelize = (source: string): string => (
  source.split(/[\s-_]/).map(camelizeFirst).join('')
);

/**
 * ```ts
 * camelizeSmall('FOO_BAR')
 * // fooBar
 * ```
 */
export const camelizeSmall = (source: string): string => {
  const value: string = camelize(source);

  return value[0].toLowerCase() + value.slice(1);
};

/**
 * ```ts
 * dasherize('FooBarBaz')
 * // foo-bar-baz
 *
 * dasherize('This is epic')
 * // this-is-epic
 * ```
 */
export const dasherize = (rawSource: string): string => {
  const source: string = rawSource.split(' ').join('-');
  const match: RegExpMatchArray | null = source.match(/[A-Z]/g);

  if (match === null) return source;

  const upperCases: RegExpMatchArray = match;
  const upperAmount: number = upperCases.length;
  const result: string[] = source.split('');

  for (let i: number = 0; i < upperAmount; i += 1) {
    const charIndex: number = result.indexOf(upperCases[i]);

    result[charIndex] = result[charIndex].toLowerCase();

    if (i !== 0) result.splice(charIndex, 0, '-');
  }

  return result.join('');
};

// # Utilities

export enum Token {
  BACKTICK = '`',
  CODE_START = '<code>',
  CODE_END = '</code>',
  BOLD = '**',
  ITALIC = '_',
  NEWLINE = '\n',
  PRE = '```'
}

export const tokenize = (rawSource: string | string[], token: Token, language: string = ''): string => {
  const source: string = (
    Array.isArray(rawSource)
      ? rawSource.join(' ')
      : rawSource
  );

  const leftAddition: string = (language ? language + Token.NEWLINE : '');
  const rightAddition: string = (language ? '\n' : '');

  const leftToken: Token = token;
  let rightToken: Token = token;

  if (leftToken === Token.CODE_START) rightToken = Token.CODE_END;

  return leftToken + leftAddition + source + rightAddition + rightToken;
};

export const calculateLongestStrings = (matrix: string[][]): number[] => {
  const lengths: number[] = [];

  for (const row of matrix) {
    for (const [elementIndex, element] of row.entries()) {
      if (element.length > (lengths[elementIndex] ?? 0)) {
        lengths[elementIndex] = element.length;
      }
    }
  }

  return lengths.map(
    (element: number) => element + 1
  );
};

export const createTableSeparator = (lengths: number[]): string => {
  const amount: number = lengths.length;
  let result: string = '';

  for (let i: number = 0; i < amount; i += 1) {
    const length: number = lengths[i];

    result += `| :${'-'.repeat(length - 3)}: `;
  }

  result += '|';

  return result;
};

export const createTableRow = (elements: string[], lengths: number[], center: boolean = false): string => {
  let result: string = '';

  for (const [index, element] of elements.entries()) {
    const length: number = lengths[index];

    let leftSpaces: number = 1;
    let rightSpaces: number = length - element.length;

    if (center) {
      const value: number = (leftSpaces + rightSpaces) / 2;

      leftSpaces = Math.floor(value);
      rightSpaces = Math.ceil(value);
    }

    result += `|${' '.repeat(leftSpaces)}${element}${' '.repeat(rightSpaces)}`;
  }

  result += '|';

  return result;
};

export const generateAnchor = (element: string): string => (
  `#${
    element.toLowerCase()
      .split(' ')
      .map(
        (kElement: string) => kElement.replace(/,/g, '')
      )
      .join('-')
  }`
);

// # Markdown shit

/**
 * ```ts
 * header(1, 'Test') // # Test
 * ```
 * 
 * # Test
 * 
 * ---
 * 
 * ```ts
 * header(3, 'Foo bar baz') // ### Foo bar baz
 * ```
 * 
 * ### Foo bar baz
 */
export const header = (level: number = 1, text: string): string => (
  `${'#'.repeat(level)} ${text}`
);

/**
 * ```ts
 * code('MessageContext') // `MessageContext`
 * ```
 * 
 * `MessageContext`
 * 
 * ---
 * 
 * ```ts
 * header(2, code('InlineQueryContext')) // ## `InlineQueryContext`
 * ```
 * 
 * ## `InlineQueryContext`
 */
export const code = (...args: string[]): string => (
  tokenize(
    args.map(
      (element: string): string => element.replace(/\|/g, '&#124;')
    ),

    (
      args.some(
        (element: string): boolean => element.includes('&#124;')
      ) ? Token.CODE_START : Token.BACKTICK
    )
  )
);

/**
 * ```ts
 * bold('Triggered when new message occurs.') // **Triggered when new message occurs**
 * ```
 * 
 * **Triggered when new message occurs**
 */
export const bold = (...args: string[]): string => tokenize(args, Token.BOLD);

/**
 * ```ts
 * italic('May be', code('undefined')) // _May be `undefined`_
 * ```
 * 
 * _May be `undefined`_
 */
export const italic = (...args: string[]): string => tokenize(args, Token.ITALIC);

/**
 * ```ts
 * pre('ts', 'import { Telegram } from "puregram";')
 * // ```ts
 * // import { Telegram } from "puregram";
 * // ```
 * ```
 * 
 * ```ts
 * import { Telegram } from "puregram";
 * ```
 */
export const pre = (language: string = '', ...args: string[]): string => tokenize(args, Token.PRE, language);

/**
 * ```ts
 * link(code('Context'), 'context.md') // [`Context`](context.md)
 * ```
 * 
 * [`Context`](context.md)
 */
export const link = (text: string, source: string): string => `[${text}](${source})`;

/**
 * ```ts
 * table([
 *   ['Header 1', 'Header 2'],
 *   [bold('Value 1'), code('Value 2')]
 * ])
 * 
 * // |  Header 1   | Header 2  |
 * // | :---------: | :-------: |
 * // | **Value 1** | `Value 2` |
 * ```
 * 
 * |  Header 1   | Header 2  |
 * | :---------: | :-------: |
 * | **Value 1** | `Value 2` |
 */
export const table = (rawMatrix: string[][]): string => {
  const [head, ...matrix] = rawMatrix;

  const lengths: number[] = calculateLongestStrings([[...head], ...matrix]);
  const headRow: string = createTableRow(head, lengths, true);
  const separator: string = createTableSeparator(lengths);

  const rows: string[] = [headRow, separator];

  for (const row of matrix) {
    rows.push(createTableRow(row, lengths));
  }

  /// TODO: "&#124;" instead of "|"

  return rows.join('\n');
};

/**
 * ```ts
 * const elements = [
 *   'Ask something',
 *   'Answer something',
 *   `I don't know, ${bold('Pizza 🍕')}?`
 * ];
 * 
 * list('*', ...elements)
 * // * Ask something
 * // * Answer something
 * // * I don't know, **Pizza 🍕**?
 * ```
 * 
 * * Ask something
 * * Answer something
 * * I don't know, **Pizza 🍕**?
 */
export const list = (token: '*' | '-' | '=' = '*', ...elements: string[]): string => (
  elements.map(
    (element: string): string => `${token} ${element}`
  ).join('\n')
);
