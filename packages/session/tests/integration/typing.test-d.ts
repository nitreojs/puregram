// type-only test — checked by tsc (when included in a project) and consumed by IDE LSP
// vitest's test.include glob (`tests/**/*.test.ts`) does not pick up `*.test-d.ts`
// the SessionData augmentation here is intentionally module-scoped — it leaks to other
// test files via the eslint tsconfig (`tests/**/*`). keep the augmented shape minimal
// and aligned with what session.test.ts's `initial: () => ({ counter: 100 })` returns,
// so cross-file consistency is preserved

import type { CallbackQueryUpdate, MessageUpdate } from '@puregram/api'
import type { Telegram } from 'puregram'

import { session } from '../../src'

declare module '../../src' {
  interface SessionData {
    counter: number
  }
}

declare const tg: Telegram

tg.extend(session())

tg.onMessage((u: MessageUpdate) => {
  // typed via SessionData augmentation
  u.session.counter = 1

  const c: number = u.session.counter

  // ensure `c` participates in the type system (no `void`-discard per lint)
  if (c < 0) {
    throw new Error('unreachable')
  }

  // $forceUpdate is exposed at runtime, declared on SessionContext
  return u.session.$forceUpdate()
})

tg.onCallbackQuery((u: CallbackQueryUpdate) => {
  // same SessionData shape on every augmented kind
  u.session.counter = 2

  // unknown-keyed runtime field still typechecks via index signature
  u.session.adhoc = 'x'

  return u.session.adhoc
})
