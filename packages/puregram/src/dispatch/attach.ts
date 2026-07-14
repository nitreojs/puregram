interface AttachOptions {
  /** whether the attached property is enumerable (default `false`) — keep off for dispatch metadata */
  enumerable?: boolean
  /** whether the attached value can be reassigned (default `false`) — set true for mutable scratch slots */
  writable?: boolean
}

/**
 * define a non-enumerable property on a dispatched update (or any object). the assertion
 * signature narrows `target` in the calling scope, so per-update augmentation — the
 * `req.user` pattern — is typed with no casts:
 *
 * ```ts
 * tg.use(filters.kind.message, async (message, next) => {
 *   attach(message, 'user', await db.users.get(message.senderId))
 *   message.user // typed
 *   await next()
 * })
 * ```
 *
 * downstream handlers see the property at runtime but not in types — gate them on a
 * `defineFilter<Base, { user: DbUser }>` whose `Mod` carries the attached shape, the same
 * mechanism `filters.text` uses to type `update.match`
 */
export function attach<T extends object, K extends string, V> (
  target: T,
  name: K,
  value: V,
  options: AttachOptions = {}
): asserts target is T & Record<K, V> {
  Object.defineProperty(target, name, {
    value,
    configurable: true,
    enumerable: options.enumerable ?? false,
    writable: options.writable ?? false
  })
}
