import { readFileSync, createReadStream } from 'node:fs'

import { Telegram, MediaSource } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage(async (message) => {
  // every helper accepts any `MediaInput` — pick the source kind that matches what you have on hand
  await message.sendPhoto(MediaSource.url('https://placehold.co/200.png'))
  await message.sendPhoto(MediaSource.path('./assets/local.png'))
  await message.sendPhoto(MediaSource.buffer(readFileSync('./assets/local.png')))
  await message.sendPhoto(MediaSource.stream(createReadStream('./assets/local.png')))

  // file-id is a previously-uploaded file — telegram already has the bytes, no upload needed
  // file ids are bot-specific and can change; cache via @puregram/media-cacher in production
  if (process.env.PHOTO_FILE_ID) {
    await message.sendPhoto(MediaSource.fileId(process.env.PHOTO_FILE_ID))
  }
})

await telegram.startPolling()
