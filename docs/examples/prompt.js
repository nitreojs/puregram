import { Telegram } from 'puregram'
import { PromptManager } from '@puregram/prompt'

const telegram = new Telegram({
  token: process.env.TOKEN
})

const manager = new PromptManager()

telegram.updates.use(manager.middleware)

telegram.updates.on('message', async (context) => {
  let answer

  while (!answer || !answer.context.hasAttachments('photo')) {
    answer = await context.prompt('*Send nudes* pls', { parse_mode: 'markdown' })
  }

  await context.send('Yooooo thanks for nudes cya')
})

telegram.updates.startPolling().then(
  () => console.log(`Started polling @${telegram.bot.username}`)
).catch(console.error)
