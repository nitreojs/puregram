/** thrown when `pack()` produces a payload longer than telegram's 64-byte limit */
export class CallbackDataTooLong extends Error {
  /** the offending packed string */
  readonly data: string
  /** utf-8 byte length of the offending string */
  readonly length: number

  constructor (data: string, length: number) {
    super(`callback-data payload is ${length} bytes, max is 64`)
    this.name = 'CallbackDataTooLong'
    this.data = data
    this.length = length
  }
}

/** thrown when a value passed to `pack()` doesn't match its declared field type */
export class CallbackDataInvalid extends Error {
  /** name of the field that failed validation */
  readonly field: string

  constructor (field: string, message: string) {
    super(`field "${field}": ${message}`)
    this.name = 'CallbackDataInvalid'
    this.field = field
  }
}
