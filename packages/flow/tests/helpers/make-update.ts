import type { UpdateKindMap } from '@puregram/api'

/**
 * cheap synthetic update factory — matches the shape the dispatch chain needs
 * (kind discriminator + minimal getters + raw payload). enough for middleware-level
 * tests; codegen'd update classes are not required at this layer
 *
 * accepts a flat body and exposes it both at the top level (for getters like
 * `update.chat`) and nested under `raw` (for the augment middleware's
 * `update.raw.chat` extractors)
 */
export function makeUpdate<K extends keyof UpdateKindMap> (kind: K, body: Record<string, unknown>) {
  return { kind, ...body, raw: body } as unknown as UpdateKindMap[K]
}
