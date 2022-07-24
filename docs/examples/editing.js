import { Telegram, InlineKeyboard, MediaSource } from 'puregram'
import { HearManager } from '@puregram/hear'

const telegram = Telegram.fromToken(process.env.TOKEN)

const hearManager = new HearManager()

telegram.updates.on('message', hearManager.middleware)

// INFO: editing text in a text message
hearManager.hear('/text', async (context) => {
  const sentMessage = await context.send('some *message* to edit.', {
    parse_mode: 'markdown'
  })

  setTimeout(
    () => sentMessage.editMessageText('some _edited message text_.', {
      parse_mode: 'markdown'
    }),
    1000
  )
})

// INFO: editing a caption of some media attachment
hearManager.hear('/caption', async (context) => {
  const media = MediaSource.path('./photo.jpg')

  const sentMessage = await context.sendPhoto(media, {
    caption: 'some *photo* with _caption_',
    parse_mode: 'markdown'
  })

  setTimeout(
    () => sentMessage.editMessageCaption('edited *photo* _caption_ goes here', {
      parse_mode: 'markdown'
    }),
    1000
  )
})

// INFO: editing the media attachment
hearManager.hear('/media', async (context) => {
  const documents = [
    MediaSource.path('./file1.txt'),
    MediaSource.path('./file2.txt')
  ]

  const sentMessage = await context.sendDocument(documents[0], {
    caption: 'document #1'
  })

  setTimeout(
    () => sentMessage.editMessageMedia({
      type: 'document',
      media: documents[1],
      caption: 'document #2'
    }),
    1000
  )
})

// INFO: editing the inline keyboard
hearManager.hear('/markup', async (context) => {
  const firstKeyboard = InlineKeyboard.keyboard([
    [
      InlineKeyboard.textButton({
        text: 'some inline button',
        payload: { dummy: true }
      })
    ]
  ])

  const secondKeyboard = InlineKeyboard.keyboard([
    [
      InlineKeyboard.textButton({
        text: 'button #1',
        payload: { dummy: true }
      }),

      InlineKeyboard.textButton({
        text: 'button #2',
        payload: { dummy: true }
      })
    ],

    [
      InlineKeyboard.textButton({
        text: 'button #3',
        payload: { dummy: true }
      })
    ]
  ])

  const sentMessage = await context.send('some message with an inline keyboard.', {
    reply_markup: firstKeyboard
  })

  setTimeout(
    () => sentMessage.editMessageReplyMarkup(secondKeyboard),
    1000
  )
})

// INFO: triggered when no other hears are triggered
hearManager.onFallback((context) => context.send('command not found.'))

telegram.updates.startPolling().then(
  () => console.log(`started polling @${telegram.bot.username}`)
).catch(console.error)
