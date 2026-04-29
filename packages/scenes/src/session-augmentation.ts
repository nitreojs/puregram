// declaration-merges `__scene` onto `@puregram/session`'s `SessionData`. with
// this loaded (via the side-effect import in src/index.ts), `update.session.__scene`
// is typed without casts on every augmented update kind

// the anchor import below is what lets the augmentation block resolve the
// target module — without it tsc can report TS2664 in some setups
import type { SessionData as _Anchor } from '@puregram/session'

import type { SceneSessionState } from './contexts/scene.types'
import type { SceneState } from './types'

declare module '@puregram/session' {
  interface SessionData {
    __scene?: SceneSessionState<SceneState>
  }
}

export {}
