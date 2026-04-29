import type { CallbackQueryUpdate, MessageUpdate } from '@puregram/api'
import { session } from '@puregram/session'
import { Telegram } from 'puregram'

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
    (p) => {
      p.scene.state.answers = []
      p.scene.state.name = 'alice'
      void p.scene.step.next()
    }
  ]
})

tg.extend(session()).extend(scenes({ scenes: [wizard] }))

tg.on('message', (u: MessageUpdate) => {
  void u.scene.enter('wizard')
  void u.scene.leave()
  const answers: string[] = u.scene.state.answers
  void answers
})

tg.on('callback_query', (u: CallbackQueryUpdate) => {
  void u.scene.current
  void u.scene.state.name
})
