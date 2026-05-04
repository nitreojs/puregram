import { Telegram, MediaSource } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage(async (message) => {
  // `MediaSource.url(...)` resolves to a remote https url — telegram fetches it server-side
  // alternatives: .path, .buffer, .stream, .fileId — see media-source-all-sources.ts
  await message.sendPhoto(
    MediaSource.url('https://placehold.co/600x400.png'),
    { caption: 'a placeholder photo' }
  )
})

await telegram.startPolling()
