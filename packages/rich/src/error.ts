/** thrown on misuse — dialect-mismatched composition, bad builder input */
export class RichError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'RichError'
  }
}

/** thrown when a source string does not fit the rich grammar; carries the offending position */
export class RichParseError extends RichError {
  constructor (message: string, readonly position: number, readonly source: string) {
    super(`${message} (at ${position})`)
    this.name = 'RichParseError'
  }
}
