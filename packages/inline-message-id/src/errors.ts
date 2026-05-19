/** thrown by {@link parseInlineMessageId} when the input is malformed */
export class InlineMessageIdParseError extends Error {
  readonly input: string | undefined

  constructor (message: string, input?: string) {
    super(message)

    this.name = 'InlineMessageIdParseError'
    this.input = input
  }
}
