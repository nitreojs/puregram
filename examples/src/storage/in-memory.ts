import { MemoryStorage } from '@puregram/storage'

// `MemoryStorage` is a thin async wrapper around `Map` — useful as a primitive outside of plugins
const storage = new MemoryStorage<number>()

await storage.set('counter', 1)
await storage.set('counter', (await storage.get('counter') ?? 0) + 1)

console.log(await storage.get('counter')) // 2

// optional iterator — backed by `Map.keys()`
for await (const key of storage.keys?.() ?? []) {
  console.log('key:', key)
}
