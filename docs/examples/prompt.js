import { Telegram } from 'puregram'
import { PromptManager } from '@puregram/prompt'

const telegram = Telegram.fromToken(process.env.TOKEN)

const manager = new PromptManager()

telegram.updates.use(manager.middleware)

telegram.updates.on('message', async (context) => {
  let answer

  while (!answer || !answer.context.hasAttachments('photo')) {
    answer = await context.prompt('*send nudes* pls', { parse_mode: 'markdown' })
  }

  await context.send('yooooo thanks for nudes cya')
})

telegram.updates.startPolling().then(
  () => console.log(`started polling @${telegram.bot.username}`)
).catch(console.error)
