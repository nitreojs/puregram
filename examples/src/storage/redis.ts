// runtime requires `ioredis` installed and a running redis — e.g. `docker run -p 6379:6379 redis`
import { RedisStorage } from '@puregram/storage-redis'
import type { RedisLikeClient } from '@puregram/storage-redis'

// `RedisLikeClient` is a structural slice of ioredis — passing the real `new Redis()` works at runtime
// here the factory is `declare`d so this example typechecks without `ioredis` installed
declare function makeRedis (): RedisLikeClient

const client = makeRedis()

const storage = new RedisStorage<{ counter: number }>({
  client,
  prefix: 'app:',
  // native ttl in milliseconds via PX — `set` writes with PX, `touch` rolls the same window forward
  ttlMs: 60_000
})

await storage.set('user:1', { counter: 1 })
await storage.touch('user:1')

console.log(await storage.get('user:1'))
