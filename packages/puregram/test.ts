import { resolve } from 'path'
import { MediaSource, Telegram } from './src'

const telegram = Telegram.fromToken('1691503329:AAEAjiwD1n9lgDfib3_0eTMaO0QmPQB4Psg')

telegram.updates.on('message', (context) => {
  if (context.senderId !== 398859857) {
    return
  }

  const document = MediaSource.path(resolve(__dirname, 'test.ts'))

  return context.sendDocument(document, { caption: 'hey!' })
})

telegram.updates.startPolling()
