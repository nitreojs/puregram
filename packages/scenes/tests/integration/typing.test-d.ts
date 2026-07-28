import type { CallbackQueryUpdate, MessageUpdate } from '@puregram/api'
import { session } from '@puregram/session'
import type { Telegram } from 'puregram'

import { scenes, StepScene } from '../../src'

// inside the package; declaration-merge against the local source
declare module '../../src/types' {
  interface SceneState {
    answers: string[]
    name: string
  }
}

declare const tg: Telegram

const wizard = new StepScene('wizard', {
  steps: [
    async (p) => {
      p.scene.state.answers = []
      p.scene.state.name = 'alice'
      await p.scene.step.next()
    }
  ]
})

tg.extend(session()).extend(scenes({ scenes: [wizard] }))

// the typed dispatchers narrow the handler arg; `tg.on(kind, …)` is the untyped custom-kind form
tg.onMessage(async (u) => {
  const _u: MessageUpdate = u

  await u.scene.enter('wizard')
  await u.scene.leave()
  const _answers: string[] = u.scene.state.answers

  return _answers
})

tg.onCallbackQuery((u) => {
  const _u: CallbackQueryUpdate = u
  const _current = u.scene.current
  const _name = u.scene.state.name

  return [_current, _name]
})
