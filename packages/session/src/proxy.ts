import { PROXY_SYM, TTL_SYM, type TtlData, type TtlWrapped } from './ttl'

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
const isPlainObject = (object: unknown): object is Record<string, unknown> => (
  Object.prototype.toString.call(object) === '[object Object]'
)

// proxiable = plain objects + arrays. excluded on purpose: class instances (serialization
// round-trip + #private fields), builtins like Date/Map/Set/RegExp/Promise (internal slots bypass Proxy traps)
// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate needed for narrowing
const isProxiable = (value: unknown): value is Record<string, unknown> => (
  isPlainObject(value) || Array.isArray(value)
)

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
const isTtlWrapped = (value: unknown): value is TtlWrapped<unknown> => (
  typeof value === 'object' && value !== null && (value as { [TTL_SYM]?: unknown })[TTL_SYM] === true
)

const isProxied = (value: unknown) => (
  typeof value === 'object' && value !== null && (value as { [PROXY_SYM]?: unknown })[PROXY_SYM] === true
)

export type ForceUpdate = () => Promise<void>
export type OnChange = () => void

/**
 * wraps `value` in a transparent proxy that:
 *   - records writes (calls `onChange()`)
 *   - records ttl entries when the assigned value is `ttl(...)`
 *   - re-proxies nested objects lazily on first access
 *   - exposes `$forceUpdate` as a magic key returning the supplied closure
 *   - exposes `PROXY_SYM` so re-wrapping is a no-op
 */
export function wrap (
  value: Record<string, unknown>,
  $forceUpdate: ForceUpdate,
  ttlMap: Map<string, TtlData>,
  onChange: OnChange
) {
  if (typeof value !== 'object' || value === null) {
    return value
  }

  if (isProxied(value)) {
    return value
  }

  const proxify = (target: Record<string, unknown>): Record<string, unknown> => (
    new Proxy(target, {
      get (t, key) {
        if (key === PROXY_SYM) {
          return true
        }

        if (key === '$forceUpdate') {
          return $forceUpdate
        }

        if (typeof key === 'symbol') {
          return t[key as unknown as string]
        }

        const k = key

        if (ttlMap.has(k)) {
          const entry = ttlMap.get(k) as TtlData
          const elapsed = Date.now() - entry.at

          if (elapsed > entry.t) {
            delete t[k]
            ttlMap.delete(k)

            return undefined
          }
        }

        const v = t[k]

        if (v === undefined || v === null) {
          return v
        }

        if (isProxiable(v) && !isProxied(v)) {
          t[k] = proxify(v)
        }

        return t[k]
      },

      set (t, key, val) {
        if (typeof key === 'symbol') {
          return false
        }

        const k = key

        onChange()

        if (isTtlWrapped(val)) {
          if (val.t < 1) {
            ttlMap.delete(k)
          } else {
            ttlMap.set(k, { t: val.t, at: Date.now() })
          }

          t[k] = val.value

          return true
        }

        if (ttlMap.has(k)) {
          const entry = ttlMap.get(k) as TtlData

          entry.at = Date.now()
          ttlMap.set(k, entry)
        }

        t[k] = val

        return true
      },

      deleteProperty (t, key) {
        if (typeof key === 'symbol') {
          return false
        }

        onChange()
        delete t[key]

        return true
      }
    })
  )

  return proxify(value)
}
