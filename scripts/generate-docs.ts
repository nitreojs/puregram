// @ts-ignore
import { stripIndents } from 'common-tags';

// # Functions that work with strings

const camelizeFirst = (source: string): string => (
  source[0].toUpperCase() + source.slice(1)
);

/**
 * @example
 * camelize('foo-bar')
 * // FooBar
 *
 * camelize('foo bar-baz')
 * // FooBarBaz
 */
const camelize = (source: string): string => (
  source.split(/[\s-]/).map(camelizeFirst).join('')
);

/**
 * @example
 * dasherize('FooBarBaz')
 * // foo-bar-baz
 *
 * dasherize('This is epic')
 * // this-is-epic
 */
const dasherize = (rawSource: string): string => {
  const source = rawSource.split(' ').join('-');
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

enum Token {
  BACKTICK = '`',
  CODE_START = '<code>',
  CODE_END = '</code>',
  BOLD = '**',
  ITALIC = '_',
  NEWLINE = '\n',
  PRE = '```'
}

const tokenize = (rawSource: string | string[], token: Token, language: string = ''): string => {
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

const calculateLongestStrings = (matrix: string[][]): number[] => {
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

const createTableSeparator = (lengths: number[]): string => {
  const amount: number = lengths.length;
  let result: string = '';

  for (let i: number = 0; i < amount; i += 1) {
    const length: number = lengths[i];

    result += `| :${'-'.repeat(length - 3)}: `;
  }

  result += '|';

  return result;
};

const createTableRow = (elements: string[], lengths: number[]): string => {
  let result: string = '';

  for (const [index, element] of elements.entries()) {
    const length: number = lengths[index];

    result += `| ${element}${' '.repeat(length - element.length)}`;
  }

  result += '|';

  return result;
};

const generateAnchor = (element: string): string => (
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
 * @example
 * header(1, 'Test')
 * // # Test
 *
 * header(3, 'Foo bar baz')
 * // # Foo bar baz
 */
const header = (level: number = 1, text: string): string => (
  `${'#'.repeat(level)} ${text}`
);

/**
 * @example
 * code('MessageContext')
 * // `MessageContext`
 *
 * header(1, code('InlineQueryContext'))
 * // # `InlineQueryContext`
 */
const code = (...args: string[]): string => (
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
 * @example
 * bold('Triggered when new message occurs.')
 * // **Triggered when new message occurs**
 */
const bold = (...args: string[]): string => tokenize(args, Token.BOLD);

/**
 * @example
 * italic('May be', code('undefined'))
 * // _May be `undefined`_
 */
const italic = (...args: string[]): string => tokenize(args, Token.ITALIC);

/**
 * @example
 * pre('ts', 'import { Telegram } from "puregram";')
 */
const pre = (language: string = '', ...args: string[]): string => tokenize(args, Token.PRE, language);

/**
 * @example
 * link(code('Context'), 'context.md')
 * // [`Context`](context.md)
 */
const link = (text: string, source: string): string => `[${text}](${source})`;

const table = (rawMatrix: string[][]): string => {
  const [head, ...matrix] = rawMatrix;
  const lengths: number[] = calculateLongestStrings(matrix);
  const headRow: string = createTableRow(head, lengths);
  const separator: string = createTableSeparator(lengths);
  const rows: string[] = [headRow, separator];

  for (const row of matrix) {
    rows.push(createTableRow(row, lengths));
  }

  return rows.join('\n');
};

const list = (elements: string[], token: '*' | '-' | '='): string => (
  elements.map(
    (element: string): string => `${token} ${element}`
  ).join('\n')
);

table(
  [
    ['Параметр', 'Тип'],
    [code('media'), code('InputMediaUnion')],
    [code('length'), code('number')]
  ]
);

interface GenerateHeaderOptions {
  context: string;

  description: string;

  triggersOn?: string;

  content: string[][];
}

const generate = (options: GenerateHeaderOptions): string => {
  const {
    context,
    description,
    triggersOn,
    content
  } = options;

  const actualTriggers: string = (
    triggersOn
      ? bold(triggersOn)
      : ''
  );

  const actualToC: string = content.map(
    ([element]: string[]): string => (
      `* ${
        link(
          bold(element),
          generateAnchor(element)
        )
      }`
    )
  ).join('\n');

  const actualContent: string = content.map(
    ([element, kContent]: string[]): string => (
      `${header(2, element)}\n\n${kContent}`
    )
  ).join('\n\n');

  return stripIndents`
    ${header(1, code(context))}
    
    ${description}
    
    ${actualTriggers}
    
    ${header(2, 'Table of Contents')}
    
    ${actualToC}
    
    ${actualContent}
  `;
};
