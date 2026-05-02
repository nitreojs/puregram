// merges `__scene` onto `@puregram/session`'s `SessionData`. the anchor import below
// is required for the module-augmentation block — tsc reports TS2664 without it
import type { SessionData as _Anchor } from '@puregram/session'

import type { SceneSessionState } from './contexts/scene.types'
import type { SceneState } from './types'

declare module '@puregram/session' {
  interface SessionData {
    __scene?: SceneSessionState<SceneState>
  }
}

export {}
