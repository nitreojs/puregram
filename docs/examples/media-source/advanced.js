import { Telegram, MediaSource, InputMedia } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.on('message', (context) => {
  if (context.text === '/media') {
    // INFO: imagine that this array is full of URLs
    const urls = []

    const results = urls.map(
      (url, i) => InputMedia.photo(MediaSource.url(url, { forceUpload: true }), {
        caption: i === 0 ? 'caption for a media' : undefined
      })
    )

    return context.sendMediaGroup(results)
  }
})

telegram.updates.startPolling()
  .then(() => console.log(`started polling @${telegram.bot.username}`))
  .catch(console.error)
