/**
 * generate a random alphanumeric string of `length` chars (default 16).
 * useful for `InlineQueryResult.id` and any other place telegram wants an opaque unique-per-call id
 *
 * @example
 * ```ts
 * InlineQueryResult.article({ id: randomId(), title: '…', content: ... })
 * InlineQueryResult.article({ id: `${randomId(8)}-suffix`, ... })
 * ```
 */
export function randomId (length = 16) {
  let out = ''

  while (out.length < length) {
    out += Math.random().toString(36).slice(2)
  }

  return out.slice(0, length)
}
