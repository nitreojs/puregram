/**
 * ```ts
 * camelizeFirst('fooBar')
 * // FooBar
 * ```
 */
export const camelizeFirst = (source: string) => (
  source[0].toUpperCase() + source.slice(1)
)

/**
 * ```ts
 * camelize('foo-bar')
 * // FooBar
 *
 * camelize('foo bar-baz')
 * // FooBarBaz
 * ```
 */
export const camelize = (source: string) => (
  source.split(/[\s-_]/).map(camelizeFirst).join('')
)

/**
 * ```ts
 * camelizeSmall('FOO_BAR')
 * // fooBar
 * ```
 */
export const camelizeSmall = (source: string) => {
  const value = camelize(source)

  return value[0].toLowerCase() + value.slice(1)
}

/**
 * ```ts
 * dasherize('FooBarBaz')
 * // foo-bar-baz
 *
 * dasherize('This is epic')
 * // this-is-epic
 * ```
 */
export const dasherize = (rawSource: string) => {
  const source = rawSource.split(' ').join('-')
  const match = source.match(/[A-Z]/g)

  if (match === null) {
    return source
  }

  const upperCases = match
  const upperAmount = upperCases.length
  const result = source.split('')

  for (let i = 0; i < upperAmount; i += 1) {
    const charIndex = result.indexOf(upperCases[i])

    result[charIndex] = result[charIndex].toLowerCase()

    if (i !== 0) result.splice(charIndex, 0, '-')
  }

  return result.join('')
}

// # Utilities

export enum Token {
  Backtick = '`',
  CodeStart = '<code>',
  CodeEnd = '</code>',
  Bold = '**',
  Italic = '_',
  Newline = '\n',
  Pre = '```'
}

export const tokenize = (rawSource: string | string[], token: Token, language = '') => {
  const source = (
    Array.isArray(rawSource)
      ? rawSource.join(' ')
      : rawSource
  )

  const leftAddition = (language ? language + Token.Newline : '')
  const rightAddition = (language ? '\n' : '')

  const leftToken = token
  let rightToken = token

  if (leftToken === Token.CodeStart) rightToken = Token.CodeEnd

  return leftToken + leftAddition + source + rightAddition + rightToken
}

export const calculateLongestStrings = (matrix: string[][]) => {
  const lengths: number[] = []

  for (const row of matrix) {
    for (const [elementIndex, element] of row.entries()) {
      if (element.length > (lengths[elementIndex] ?? 0)) {
        lengths[elementIndex] = element.length
      }
    }
  }

  return lengths.map(element => element + 1)
}

export const createTableSeparator = (lengths: number[]) => {
  const amount = lengths.length
  let result = ''

  for (let i = 0; i < amount; i += 1) {
    const length = lengths[i]

    result += `| :${'-'.repeat(length - 3)}: `
  }

  result += '|'

  return result
}

export const createTableRow = (elements: string[], lengths: number[], center = false) => {
  let result = ''

  for (const [index, element] of elements.entries()) {
    const length = lengths[index]

    let leftSpaces = 1
    let rightSpaces = length - element.length

    if (center) {
      const value = (leftSpaces + rightSpaces) / 2

      leftSpaces = Math.floor(value)
      rightSpaces = Math.ceil(value)
    }

    result += `|${' '.repeat(leftSpaces)}${element}${' '.repeat(rightSpaces)}`
  }

  result += '|'

  return result
}

export const generateAnchor = (element: string) => (
  `#${element.toLowerCase()
    .split(' ')
    .map(kElement => kElement.replace(/,/g, ''))
    .join('-')
  }`
)

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
export const header = (level = 1, text: string) => (
  `${'#'.repeat(level)} ${text}`
)

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
export const code = (...args: string[]) => (
  tokenize(
    args.map(element => element.replace(/\|/g, '&#124;')),
    args.some(element => element.includes('&#124;'))
      ? Token.CodeStart
      : Token.Backtick
  )
)

/**
 * ```ts
 * bold('Triggered when new message occurs.') // **Triggered when new message occurs**
 * ```
 *
 * **Triggered when new message occurs**
 */
export const bold = (...args: string[]) => tokenize(args, Token.Bold)

/**
 * ```ts
 * italic('May be', code('undefined')) // _May be `undefined`_
 * ```
 *
 * _May be `undefined`_
 */
export const italic = (...args: string[]) => tokenize(args, Token.Italic)

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
export const pre = (language = '', ...args: string[]) => tokenize(args, Token.Pre, language)

/**
 * ```ts
 * link(code('Context'), 'context.md') // [`Context`](context.md)
 * ```
 *
 * [`Context`](context.md)
 */
export const link = (text: string, source: string) => `[${text}](${source})`

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
export const table = (rawMatrix: string[][]) => {
  const [head, ...matrix] = rawMatrix

  const lengths = calculateLongestStrings([[...head], ...matrix])
  const headRow = createTableRow(head, lengths, true)
  const separator = createTableSeparator(lengths)

  const rows = [headRow, separator]

  for (const row of matrix) {
    rows.push(createTableRow(row, lengths))
  }

  /// TODO: "&#124;" instead of "|"

  return rows.join('\n')
}

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
export const list = (token: '*' | '-' | '=' = '*', ...elements: string[]) => (
  elements.map(element => `${token} ${element}`).join('\n')
)
