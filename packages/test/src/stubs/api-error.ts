const SENTINEL = Symbol.for('puregram.test.apiError')

export interface ApiErrorSentinel {
  readonly [SENTINEL]: true
  readonly error_code: number
  readonly description: string
  readonly parameters?: { retry_after?: number, migrate_to_chat_id?: number }
}

export function apiError (
  errorCode: number,
  description: string,
  parameters?: { retry_after?: number, migrate_to_chat_id?: number }
) {
  const sentinel: ApiErrorSentinel = {
    [SENTINEL]: true,
    error_code: errorCode,
    description,
    ...(parameters !== undefined ? { parameters } : {})
  }

  return sentinel
}

export function isApiErrorSentinel (value: unknown): value is ApiErrorSentinel {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  return (value as { [SENTINEL]?: unknown })[SENTINEL] === true
}
