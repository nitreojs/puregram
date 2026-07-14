import { rich } from '@puregram/rich'
import { MediaSource, Telegram } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

// a 1x1 png so the example is self-contained — swap for MediaSource.path('./photo.jpg') etc
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
)

// media builders accept an http(s) url OR any MediaSource.* — uploads (path/buffer/forced url)
// resolve at send time via multipart, embedded right inside the block list
telegram.onMessage(async (message) => {
  if (!message.hasText()) {
    return
  }

  await message.sendRich(rich([
    rich.h2('media in blocks'),
    rich.photo('https://picsum.photos/600/400', { caption: 'by url', credit: 'picsum' }),
    rich.photo(MediaSource.buffer(TINY_PNG, { filename: 'dot.png' }), { caption: 'uploaded buffer', spoiler: true })
  ]))
})

await telegram.startPolling()
