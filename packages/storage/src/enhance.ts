/* eslint-disable @typescript-eslint/require-await -- KVStorage contract is async */
import type { KVStorage } from './kv-storage'

/** options accepted by {@link enhanceStorage} */
export interface EnhanceStorageOptions {
  /** when set, attach `__exp` (unix ms) so reads can lazily evict stale entries */
  millisecondPrecision?: boolean
  /**
   * versioned migrations applied lazily on read. keyed by the target version —
   * `migrations[1]` upgrades v0 (unversioned legacy data) to v1, `migrations[2]`
   * runs after to upgrade v1 to v2, and so on. the latest key wins as the
   * "current version" written by `set`
   */
  migrations?: Record<number, (data: unknown) => unknown>
}

interface Envelope<V> {
  __v: number
  __exp?: number
  data: V
}

const ENVELOPE_SHAPE: keyof Envelope<unknown> = '__v'

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate needed for narrowing
const isEnvelope = (value: unknown): value is Envelope<unknown> => (
  typeof value === 'object' && value !== null && ENVELOPE_SHAPE in value
)

const latestVersion = (migrations: Record<number, unknown>) => {
  const keys = Object.keys(migrations).map(Number).filter(n => Number.isFinite(n))

  if (keys.length === 0) {
    return 0
  }

  return Math.max(...keys)
}

/**
 * wraps a base {@link KVStorage} with versioned migrations and optional
 * per-entry expiry encoded inline as `__exp`. envelope keys (`__v`, `__exp`,
 * `data`) are namespaced to minimise collision with user payloads
 */
export function enhanceStorage<V> (base: KVStorage<unknown>, opts: EnhanceStorageOptions = {}) {
  const migrations = opts.migrations ?? {}
  const target = latestVersion(migrations)

  const runMigrations = async (raw: unknown, from: number) => {
    let current: unknown = raw
    let v = from

    while (v < target) {
      const next = v + 1
      const migrate = migrations[next]

      if (migrate === undefined) {
        v = next
        continue
      }

      current = await migrate(current)
      v = next
    }

    return current as V
  }

  const enhanced: KVStorage<V> = {
    get: async (key: string) => {
      const raw = await base.get(key)

      if (raw === undefined) {
        return undefined
      }

      if (isEnvelope(raw)) {
        if (raw.__exp !== undefined && Date.now() > raw.__exp) {
          await base.delete(key)

          return undefined
        }

        if (raw.__v < target) {
          const migrated = await runMigrations(raw.data, raw.__v)
          const envelope: Envelope<V> = { __v: target, data: migrated }

          if (raw.__exp !== undefined) {
            envelope.__exp = raw.__exp
          }

          await base.set(key, envelope)

          return migrated
        }

        return raw.data as V
      }

      // legacy unversioned data — treat as v0 and migrate forward
      const migrated = await runMigrations(raw, 0)
      const envelope: Envelope<V> = { __v: target, data: migrated }

      await base.set(key, envelope)

      return migrated
    },

    set: async (key: string, value: V) => {
      const envelope: Envelope<V> = { __v: target, data: value }

      // preserve existing __exp via touch-style read-modify-write so callers can layer
      // ttl on top by setting __exp before calling base.set
      if (opts.millisecondPrecision === true) {
        const existing = await base.get(key)

        if (isEnvelope(existing) && existing.__exp !== undefined) {
          envelope.__exp = existing.__exp
        }
      }

      await base.set(key, envelope)
    },

    delete: (key: string) => base.delete(key),
    has: (key: string) => base.has(key)
  }

  if (base.keys !== undefined) {
    enhanced.keys = base.keys.bind(base)
  }

  return enhanced
}
