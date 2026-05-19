import { enhanceStorage, MemoryStorage } from '@puregram/storage'

// v1 wrote a flat `{ count }`; v2 renamed it to `{ counter }` and added `last_seen`
// `enhanceStorage` lazily migrates legacy reads — old keys upgrade on first access, set writes the latest version
interface Counter {
  counter: number
  last_seen: number
}

const base = new MemoryStorage<unknown>()

// seed with a pre-migration value to demonstrate the upgrade path
await base.set('user:1', { count: 7 })

const storage = enhanceStorage<Counter>(base, {
  // millisecond precision attaches `__exp` envelopes so consumers can lazily evict stale entries
  millisecondPrecision: true,
  migrations: {
    1: (data) => ({ counter: (data as { count?: number }).count ?? 0 }),
    2: (data) => ({ ...(data as { counter: number }), last_seen: Date.now() })
  }
})

console.log(await storage.get('user:1')) // { counter: 7, last_seen: <now> }

await storage.set('user:2', { counter: 0, last_seen: Date.now() })
console.log(await storage.get('user:2'))
