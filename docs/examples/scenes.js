import { Telegram, InlineKeyboard } from 'puregram'
import { SessionManager } from '@puregram/session'
import { SceneManager, StepScene } from '@puregram/scenes'
import { HearManager } from '@puregram/hear'

const telegram = new Telegram({
  token: process.env.TOKEN
})

const sessionManager = new SessionManager()
const sceneManager = new SceneManager()
const hearManager = new HearManager()

// Both message and callback query because we will
// handle messages and inline keyboard button taps
const events = ['message', 'callback_query']

telegram.updates.on(events, sessionManager.middleware)
telegram.updates.on(events, sceneManager.middleware)
telegram.updates.on(events, sceneManager.middlewareIntercept)
telegram.updates.on('message', hearManager.middleware)

hearManager.hear(
  /^\/hello$/i,
  (context) => context.scene.enter('hello')
)

// Setting up our steps
sceneManager.addScenes([
  new StepScene('hello', [
    (context) => {
      if (context.scene.step.firstTime) {
        const keyboard = InlineKeyboard.keyboard([
          [
            InlineKeyboard.textButton({
              text: 'Male',
              payload: { sex: 'male' }
            }),

            InlineKeyboard.textButton({
              text: 'Female',
              payload: { sex: 'female' }
            })
          ],

          [
            InlineKeyboard.textButton({
              text: 'Prefer not to say',
              payload: { sex: 'android' }
            })
          ]
        ])

        return context.send(
          'Welcome. Please tell me, ' +
          'are you a man or a woman.',
          { reply_markup: keyboard }
        )
      }

      if (!context.is('callback_query')) {
        return context.deleteMessage()
      }

      const sex = context.queryPayload.sex

      context.scene.state.sex = sex

      return context.scene.step.next()
    },

    async (context) => {
      const sex = context.scene.state.sex

      const phrase = {
        male: 'Ayy bro! How ya doin\'?',
        female: 'Hello, mam, you are welcome.',
        android: 'So you are android? 01100100100101.'
      }[sex]

      await context.message.editMessageText(phrase)

      // Automatic exit because this is the last step
      return context.scene.step.next()
    }
  ])
])

telegram.updates.startPolling().then(
  () => console.log(`Started polling @${telegram.bot.username}`)
).catch(console.error)

