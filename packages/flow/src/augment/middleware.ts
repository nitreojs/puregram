import type { UpdateKindMap } from '@puregram/api'
import type { Middleware } from 'puregram'

import type { Filter, WaitForOptions } from '../wait-for/types'

import { EXTRACTORS, type ExtractedScope } from './extractors'
import type {
  AugmentedWaitForMatch,
  AugmentedWaitForOptions,
  UpdateFlowExtension
} from './types'

interface KindRaw {
  kind: string
  raw: unknown
}

interface FlowApi {
  prompt: (chat: number | string, text: string, options?: { from?: number, timeout?: number, nullOnTimeout?: boolean }) => Promise<UpdateKindMap['message'] | null>
  waitFor: <K extends keyof UpdateKindMap> (kind: K, options?: WaitForOptions<K>) => Promise<UpdateKindMap[K] | null>
}

// attaches a context-bound `flow` to every incoming update whose kind has an
// EXTRACTORS entry. the bound view auto-fills chat (and a default sender filter)
// derived from the source update, so handlers don't have to thread chat/user ids
// through every prompt/waitFor call.
//
// must register before createWaitForMiddleware so an `update.flow.waitFor(...)`
// invoked synchronously inside a high-priority handler still sees its own
// augmentation on the source update if the same update is replayed
export function createAugmentMiddleware (flow: FlowApi) {
  const middleware: Middleware<unknown> = async (update, next) => {
    if (typeof update !== 'object' || update === null) {
      await next()

      return
    }

    const candidate = update as Partial<KindRaw>
    const kind = candidate.kind

    if (typeof kind !== 'string') {
      await next()

      return
    }

    const extractor = EXTRACTORS[kind]

    if (!extractor) {
      await next()

      return
    }

    const scope = extractor(candidate as KindRaw)

    Object.defineProperty(update, 'flow', {
      value: createUpdateFlowExtension(flow, scope),
      enumerable: false,
      configurable: false,
      writable: false
    })

    await next()
  }

  return middleware
}

function createUpdateFlowExtension (flow: FlowApi, scope: ExtractedScope) {
  const ext: UpdateFlowExtension = {
    prompt: (text, options = {}) => {
      const { chat, from, ...rest } = options
      const chatId = chat ?? scope.chat

      if (chatId === undefined) {
        throw new Error('update.flow.prompt: no chat available on this update')
      }

      // from semantics: explicit `from` (including `undefined`) wins; absent key
      // falls back to `scope.from` so the prompt is sender-pinned by default
      // and "anyone in the chat" requires `{ from: undefined }`.
      // pass-through has to drop the key entirely when undefined —
      // `exactOptionalPropertyTypes` disallows `from: undefined` on PromptOptions
      const resolvedFrom = 'from' in options ? from : scope.from

      return resolvedFrom === undefined
        ? flow.prompt(chatId, text, rest)
        : flow.prompt(chatId, text, { ...rest, from: resolvedFrom })
    },

    waitFor: <K extends keyof UpdateKindMap> (kind: K, options: AugmentedWaitForOptions<K> = {}) => {
      const { match: explicit, filter, ...rest } = options
      const match: AugmentedWaitForMatch = explicit ?? defaultMatch(scope)

      const scoped = wrapFilter(match, scope, filter)

      const passthrough: WaitForOptions<K> = scoped !== undefined
        ? { ...rest, filter: scoped }
        : rest

      return flow.waitFor(kind, passthrough)
    }
  }

  return ext
}

function defaultMatch (scope: ExtractedScope) {
  if (scope.chat === undefined) {
    return 'none' as const
  }

  if (scope.from === undefined) {
    return 'chat' as const
  }

  return 'chat+from' as const
}

function wrapFilter<K extends keyof UpdateKindMap> (
  match: AugmentedWaitForMatch,
  scope: ExtractedScope,
  userFilter: Filter<UpdateKindMap[K]> | undefined
) {
  if (match === 'none') {
    return userFilter
  }

  const scoped: Filter<UpdateKindMap[K]> = (candidate) => {
    const candKindRaw = candidate as unknown as KindRaw
    const ext = EXTRACTORS[candKindRaw.kind]

    if (!ext) {
      return false
    }

    const candScope = ext(candKindRaw)

    if (candScope.chat !== scope.chat) {
      return false
    }

    if (match === 'chat+from' && candScope.from !== scope.from) {
      return false
    }

    return userFilter ? userFilter(candidate) : true
  }

  return scoped
}
