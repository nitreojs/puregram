import type { MessageUpdate } from '@puregram/api'
import { describe, expectTypeOf, it } from 'vitest'

import type { FlowHandleConfig, FlowHandleContext, FlowHandlers } from '../../src/persistent/types'

declare module '../../src/persistent/types' {
  interface FlowHandlers {
    'register:name': { kind: 'message', payload: undefined, result: string }
    'register:age': { kind: 'message', payload: { name: string }, result: number }
    'confirm:choice': { kind: 'callback_query', payload: { messageId: number }, result: 'yes' | 'no' }
  }
}

describe('FlowHandlers augmentation', () => {
  it('handle config with augmentation enforces kind + payload + result', () => {
    type AgeCfg = FlowHandleConfig<'message', number>

    expectTypeOf<AgeCfg['transform']>().toEqualTypeOf<((u: MessageUpdate) => number) | undefined>()
  })

  it('augmented FlowHandlers entries are visible at the type level', () => {
    expectTypeOf<FlowHandlers['register:age']>().toMatchTypeOf<{
      kind: 'message'
      payload: { name: string }
      result: number
    }>()
  })

  it('handle context payload is accessible (still unknown in v1)', () => {
    type Ctx = FlowHandleContext<'message'>

    // payload typing on the *handler-side* is deferred — registry surfaces call-site typing only
    // for v1; later versions can specialise via overloads on flow.handle keyed by FlowHandlers
    expectTypeOf<Ctx['payload']>().toEqualTypeOf<unknown>()
  })
})
