// runtime requires `better-sqlite3` peer dep installed
import { SqliteStorage } from '@puregram/storage-sqlite'
import type { SqliteLikeDatabase } from '@puregram/storage-sqlite'

// the structural `SqliteLikeDatabase` matches `new Database('./data.sqlite')` at runtime
// `declare`d here so the example typechecks without `better-sqlite3` installed
declare function openDb (path: string): SqliteLikeDatabase

const db = openDb('./data.sqlite')

const storage = new SqliteStorage<{ visits: number }>({
  db,
  table: 'app_kv',
  ttlMs: 86_400_000,
  // background sweep batches eviction of expired rows; `get` still lazy-evicts per-row
  sweepIntervalMs: 60_000
})

await storage.set('chat:1', { visits: 1 })
console.log(await storage.get('chat:1'))

storage.close()
