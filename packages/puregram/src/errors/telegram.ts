export interface ErrorOptions {
  error_code: number
  description: string
  cause?: unknown
}

export class TelegramError extends Error {
  /** Error code */
  code: number
  /** Error stack */
  stack!: string
  /** Error cause */
  cause?: unknown

  constructor({ error_code, description, cause }: ErrorOptions) {
    super(description)

    this.code = error_code
    this.name = this.constructor.name
    this.cause = cause

    Error.captureStackTrace(this, this.constructor)
  }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  toJSON(): Pick<this, keyof this> {
    const json = {} as Pick<this, keyof this>

    for (const key of Object.getOwnPropertyNames(this)) {
      json[key as keyof this] = this[key as keyof this]
    }

    return json
  }
}
