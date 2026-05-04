import { Telegram, InlineKeyboard } from 'puregram'
import { session } from '@puregram/session'
import { scenes, StepScene } from '@puregram/scenes'
import { defineCallbackData } from '@puregram/callback-data'
import type { CallbackQueryUpdate, MessageUpdate } from 'puregram'

// declaration-merge cross-scene data onto the session shape
declare module '@puregram/session' {
  interface SessionData {
    signupCount: number
  }
}

// per-scene scratchpad — wiped when the scene leaves
interface SignupState {
  name?: string
  color?: 'red' | 'green' | 'blue'
}

// callback-data schema — packed payload is `{ value: 'red' | 'green' | 'blue' }`
const Color = defineCallbackData('signup-color').literal('value', ['red', 'green', 'blue'] as const)

// step bodies see either a MessageUpdate (text reply) or a CallbackQueryUpdate (button tap),
// since scenes intercept every update kind for users with an active scene
type WizardUpdate = MessageUpdate | CallbackQueryUpdate

const signup = new StepScene<SignupState, WizardUpdate>('signup', [
  // step 1 — ask name, accept text reply
  (update) => {
    if (!update.is('message')) {
      return
    }

    if (update.scene.step.firstTime || !update.hasText()) {
      return update.send("what's your name?")
    }

    update.scene.state.name = update.text

    return update.scene.step.next()
  },

  // step 2 — ask color via inline keyboard, accept button tap
  async (update) => {
    if (update.scene.step.firstTime && update.is('message')) {
      return update.send('pick a color:', {
        reply_markup: InlineKeyboard.keyboard([[
          Color.button({ text: 'red', value: 'red' }),
          Color.button({ text: 'green', value: 'green' }),
          Color.button({ text: 'blue', value: 'blue' })
        ]])
      })
    }

    // ignore non-callback updates while waiting for a tap (e.g. the user types instead)
    if (!update.is('callback_query') || !update.hasData() || !Color.validate(update.data)) {
      return
    }

    const payload = Color.unpack(update.data)!

    update.scene.state.color = payload.value

    await update.answer({ text: `picked ${payload.value}` })

    return update.scene.step.next()
  },

  // step 3 — echo + bump session counter; calling next() past the last step auto-leaves
  async (update) => {
    const { name, color } = update.scene.state

    update.session.signupCount += 1

    const text = `hi ${name ?? '?'} — your color is ${color ?? '?'} (signup #${update.session.signupCount})`

    if (update.is('message')) {
      await update.send(text)
    } else if (update.is('callback_query') && update.chatId !== undefined) {
      // `update.api` is the same proxy as `tg.api` — handy when the update has no per-kind shortcut
      await update.api.sendMessage({ chat_id: update.chatId, text })
    }

    return update.scene.step.next()
  }
])

const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  // session must be installed before scenes — scenes declares `dependsOn: ['session']`
  .extend(session({ initial: () => ({ signupCount: 0 }) }))
  .extend(scenes({ scenes: [signup] }))

telegram.onMessage((message) => {
  if (message.text === '/signup') {
    return message.scene.enter('signup')
  }
})

await telegram.startPolling()
