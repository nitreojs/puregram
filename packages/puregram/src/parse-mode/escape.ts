const replaceRegexpChar = (char: string) => (
  char
    .replace(/\\/g, '\\\\')
    .replace(/\//g, '\\/')
    .replace(/\[/g, '\\[')
    .replace(/]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\*/g, '\\*')
    .replace(/\+/g, '\\+')
    .replace(/\./g, '\\.')
    .replace(/\|/g, '\\|')
)

export const replaceChars = (source: string, chars: string[] | string): string => {
  let edited = source
  const actualChars = !Array.isArray(chars) ? chars.split('') : chars

  for (const char of actualChars) {
    edited = edited.replace(new RegExp(replaceRegexpChar(char), 'g'), `\\${char}`)
  }

  return edited
}
