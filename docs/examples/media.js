import fs from 'node:fs'

import { Telegram, MediaSource } from 'puregram'
import { HearManager } from '@puregram/hear'
import { stripIndents } from 'common-tags'

const telegram = new Telegram({
  token: process.env.TOKEN
})

const hearManager = new HearManager()

const URL = 'https://loremflickr.com/400/300/'
const PATH = './photo.jpg'
const BUFFER = fs.readFileSync(PATH)
const STREAM = fs.createReadStream(PATH)
const FILE_ID = 'CAACAgIAAxUAAV_0yG-eth7xGCESiv_ufQunsovbAAJBAAM8ilcaIJsdgTwqIGAeBA'

telegram.updates.on('message', hearManager.middleware)

hearManager.hear('/start', (context) => (
  context.send(
    stripIndents`
      *My commands*

      /url - send photo via URL
      /buffer - send document via Buffer
      /stream - send document via Stream
      /fileid - send sticker via File ID
      /path - send photo via path
    `,
    { parse_mode: 'Markdown' }
  )
))

hearManager.hear('/url', (context) => (
  context.sendPhoto(MediaSource.url(URL), { caption: 'Here\'s a cat sent via URL!' })
))

hearManager.hear('/buffer', (context) => (
  context.sendDocument(MediaSource.buffer(BUFFER), { caption: 'Some cool document uploaded via Buffer!' })
))

hearManager.hear('/stream', (context) => (
  context.sendDocument(MediaSource.stream(STREAM), { caption: 'Some amazing document uploaded via Stream!' })
))

hearManager.hear('/fileid', (context) => (
  context.sendSticker(MediaSource.fileId(FILE_ID))
))

hearManager.hear('/path', (context) => (
  context.sendPhoto(MediaSource.path(PATH), { caption: 'Photo attachment uploaded using local path' })
))

// As easy as that!

telegram.updates.startPolling().then(
  () => console.log(`Started polling @${telegram.bot.username}`)
).catch(console.error)
