import { Telegram, InlineKeyboard, MediaSource } from 'puregram'
import { HearManager } from '@puregram/hear'

const telegram = new Telegram({
  token: process.env.TOKEN
})

const hearManager = new HearManager()

telegram.updates.on('message', hearManager.middleware)

// Editing text in a text message
hearManager.hear('/text', async (context) => {
  const sentMessage = await context.send('Some *message* to edit.', {
    parse_mode: 'Markdown'
  })

  setTimeout(
    () => sentMessage.editMessageText('Some _edited message text_.', {
      parse_mode: 'Markdown'
    }),
    1000
  )
})

// Editing a caption of some media attachment
hearManager.hear('/caption', async (context) => {
  const media = MediaSource.path('./photo.jpg')

  const sentMessage = await context.sendPhoto(media, {
    caption: 'Some *photo* with _caption_',
    parse_mode: 'Markdown'
  })

  setTimeout(
    () => sentMessage.editMessageCaption('Edited *photo* _caption_ goes here', {
      parse_mode: 'Markdown'
    }),
    1000
  )
})

// Editing the media attachment
hearManager.hear('/media', async (context) => {
  const documents = [
    MediaSource.path('./file1.txt'),
    MediaSource.path('./file2.txt')
  ]

  const sentMessage = await context.sendDocument(documents[0], {
    caption: 'Document #1'
  })

  setTimeout(
    () => sentMessage.editMessageMedia({
      type: 'document',
      media: documents[1],
      caption: 'Document #2'
    }),
    1000
  )
})

// Editing the inline keyboard
hearManager.hear('/markup', async (context) => {
  const firstKeyboard = InlineKeyboard.keyboard([
    [
      InlineKeyboard.textButton({
        text: 'Some inline button',
        payload: { dummy: true }
      })
    ]
  ])

  const secondKeyboard = InlineKeyboard.keyboard([
    [
      InlineKeyboard.textButton({
        text: 'Button #1',
        payload: { dummy: true }
      }),

      InlineKeyboard.textButton({
        text: 'Button #2',
        payload: { dummy: true }
      })
    ],

    [
      InlineKeyboard.textButton({
        text: 'Button #3',
        payload: { dummy: true }
      })
    ]
  ])

  const sentMessage = await context.send('Some message with an inline keyboard.', {
    reply_markup: firstKeyboard
  })

  setTimeout(
    () => sentMessage.editMessageReplyMarkup(secondKeyboard),
    1000
  )
})

// Triggered when no other hears triggered
hearManager.onFallback(
  (context) => context.send('Command not found.')
)

telegram.updates.startPolling().then(
  () => console.log(`Started polling @${telegram.bot.username}`)
).catch(console.error)
