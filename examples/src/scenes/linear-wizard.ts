import { scenes, StepScene } from '@puregram/scenes'
import { session } from '@puregram/session'
import { Telegram } from 'puregram'
import type { MessageUpdate } from 'puregram'

interface SignupState {
  firstName?: string
  age?: number
}

// each step handler runs every time a matching update lands while the user sits on that step
// advance with `scene.step.next()`, leave with `scene.leave()`
const signup = new StepScene<SignupState, MessageUpdate>('signup', [
  (ctx) => {
    if (ctx.scene.step.firstTime || !ctx.hasText()) {
      return ctx.send("what's your name?")
    }

    ctx.scene.state.firstName = ctx.text

    return ctx.scene.step.next()
  },

  (ctx) => {
    if (ctx.scene.step.firstTime || !ctx.hasText()) {
      return ctx.send('how old are you?')
    }

    ctx.scene.state.age = Number.parseInt(ctx.text, 10)

    return ctx.scene.step.next()
  },

  async (ctx) => {
    const { firstName, age } = ctx.scene.state

    await ctx.send(`${firstName ?? '?'}, ${age ?? '?'} years old`)

    // calling `next()` past the last step automatically leaves the scene
    return ctx.scene.step.next()
  }
])

const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(session())
  .extend(scenes({ scenes: [signup] }))

telegram.onMessage((message) => {
  if (message.text === '/signup') {
    return message.scene.enter('signup')
  }
})

await telegram.startPolling()
