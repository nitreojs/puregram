export interface ErrorOptions {
  error_code: number;

  description: string;
}

export class TelegramError extends Error {
  /** Error code */
  public code: number;

  /** Error stack */
  public stack!: string;

  public constructor({ error_code, description }: ErrorOptions) {
    super(description);

    this.code = error_code;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  public toJSON(): Pick<this, keyof this> {
    const json = {} as Pick<this, keyof this>;

    for (const key of Object.getOwnPropertyNames(this)) {
      json[key as keyof this] = this[key as keyof this];
    }

    return json;
  }
}
