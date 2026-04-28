import type { MessageUpdate } from '@puregram/api'
import { describe, expectTypeOf, it } from 'vitest'

import type {
  FlowHandleConfig,
  FlowHandleContext,
  FlowHandlers,
  PersistedFlow
} from '../../src/persistent/types'

describe('persistent types', () => {
  it('PersistedFlow has the documented shape', () => {
    const record: PersistedFlow = {
      id: 'register:name',
      kind: 'message',
      chatId: 1,
      fromId: 2,
      payload: undefined,
      createdAt: Date.now()
    }

    expectTypeOf(record).toMatchTypeOf<{
      id: string
      kind: string
      chatId: number
      fromId: number | undefined
      payload: unknown
      createdAt: number
      expiresAt?: number
      attempts?: number
    }>()
  })

  it('FlowHandleConfig defaults kind to message and infers transform output', () => {
    const cfg: FlowHandleConfig<'message', number> = {
      transform: m => Number(m.text),
      onAnswer: (age, ctx) => {
        expectTypeOf(age).toEqualTypeOf<number>()
        expectTypeOf(ctx).toMatchTypeOf<FlowHandleContext<'message'>>()
      }
    }

    expectTypeOf(cfg.transform!).parameter(0).toEqualTypeOf<MessageUpdate>()
  })

  it('FlowHandlers is empty by default and overridable via declaration merge', () => {
    // an empty interface accepts any object shape — just confirm it is exported and usable
    const sentinel: FlowHandlers = {}

    expectTypeOf(sentinel).toBeObject()
  })
})
