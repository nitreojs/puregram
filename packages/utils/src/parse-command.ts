/** result of {@link parseCommand} when the input is a valid `/command` */
export interface ParsedCommand {
  /** command name without the leading `/` */
  command: string
  /** bot username after `@`, if present */
  bot: string | undefined
  /** rest of the text split on whitespace runs, empties dropped */
  args: string[]
  /** everything after the command (+ optional `@bot`), with leading whitespace trimmed */
  rest: string
}

const COMMAND_RE = /^\/([A-Za-z0-9_]+)(?:@([A-Za-z0-9_]{5,32}))?(?:\s+([\s\S]*))?$/

/**
 * parses a telegram bot command string of the form `/command[@bot] [args...]`.
 *
 * returns `null` when the text doesn't start with `/`, when there's no command
 * name after the slash, or when the `@bot` suffix doesn't match telegram's
 * username rules. leading whitespace is rejected — telegram commands always
 * begin at column zero
 *
 * @example
 * ```ts
 * parseCommand('/buy@my_bot apples 5')
 * // → { command: 'buy', bot: 'my_bot', args: ['apples', '5'], rest: 'apples 5' }
 * ```
 */
export function parseCommand (text: string) {
  if (typeof text !== 'string' || text.length === 0 || text[0] !== '/') {
    return null
  }

  const match = COMMAND_RE.exec(text)

  if (match === null) {
    return null
  }

  const [, command, bot, tail] = match
  const rest = tail ?? ''
  const args = rest.length === 0 ? [] : rest.split(/\s+/).filter(Boolean)
  const parsed: ParsedCommand = {
    command: command ?? '',
    bot,
    args,
    rest
  }

  return parsed
}
