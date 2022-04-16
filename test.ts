import { Telegram } from './packages/puregram'

const telegram = Telegram.fromToken('1691503329:AAHoCGkfQXUI5t5F5zX-h3nJrNGk9ujKa_8')

telegram.updates.on('web_app_data', (context) => {
  console.log(context.data)
})

telegram.updates.startPolling().then(() => console.log('started'))
