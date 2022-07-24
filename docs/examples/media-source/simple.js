import { Telegram, MediaSource } from 'puregram'

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.updates.on('message', (context) => {
  if (context.text === '/canvas') {
    // INFO: imagine that we are rendering a picture using canvas
    // INFO: ...

    const buffer = ctx.toBuffer()

    const media = MediaSource.buffer(buffer)

    return context.sendPhoto(media, {
      caption: 'here you go!'
    })
  }

  if (context.text === '/rules') {
    const file = MediaSource.path('./rules.pdf', { filename: 'Rules' })

    return context.sendDocument(file, {
      caption: 'we have some rules and you need to follow them.'
    })
  }

  if (context.text === '/voice') {
    const url = MediaSource.url(getVoiceUrl(), { forceUpload: true, filename: 'moans' })

    return context.sendAudio(url)
  }
})

telegram.updates.startPolling()
  .then(() => console.log(`started polling @${telegram.bot.username}`))
  .catch(console.error)
