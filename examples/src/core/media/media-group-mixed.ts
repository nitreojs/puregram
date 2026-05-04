import { readFileSync } from 'node:fs'

import { Telegram, MediaSource, InputMedia } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage(async (message) => {
  // a media group sends 2-10 photos/videos as one album
  // each item is an InputMedia.* — sources can mix freely (url, path, buffer)
  await message.sendMediaGroup([
    InputMedia.photo(MediaSource.url('https://placehold.co/600x400.png'), { caption: 'first' }),
    InputMedia.photo(MediaSource.path('./assets/local.png')),
    InputMedia.photo(MediaSource.buffer(readFileSync('./assets/local.png')))
  ])
})

await telegram.startPolling()
