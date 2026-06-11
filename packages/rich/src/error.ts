/** thrown on misuse — dialect-mismatched interpolation, bad builder input */
export class RichError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'RichError'
  }
}
