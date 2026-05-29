import { mediaCacher } from '@puregram/media-cacher'
import { Telegram, MediaSource } from 'puregram'

// `keyStrategy: 'hash'` keys the cache by the sha-256 of the resolved bytes instead of
// the raw path/url — so distinct sources pointing at identical content collapse to one
// cached file_id. trade-off: url sources are fetched twice (once to hash, once to upload)
const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(mediaCacher({ keyStrategy: 'hash' }))

telegram.onMessage(async (message) => {
  // if these two urls serve byte-identical content, only the first uploads — the second
  // hashes to the same key and reuses that file_id
  await message.sendPhoto(MediaSource.url('https://cdn.example.com/logo.png'))
  await message.sendPhoto(MediaSource.url('https://mirror.example.com/logo.png'))
})

await telegram.startPolling()
