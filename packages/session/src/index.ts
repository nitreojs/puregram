// @puregram/session — transparent persistent session plugin

// side-effect: loads the codegenerated `declare module '@puregram/api'`
// augmentations that attach `session: SessionContext` to every supported update kind
import './generated/augmentations'

export { session, type SessionExtension } from './session'
export { ttl, TTL_SYM, PROXY_SYM } from './ttl'
export type { TtlData, TtlWrapped } from './ttl'
export type { SessionContext, SessionData, SessionOptions, AnyUpdate } from './types'

// re-exported from @puregram/storage so users can `import { MemoryStorage } from '@puregram/session'`
// without pulling in the storage package directly. canonical import path is still '@puregram/storage'
export { MemoryStorage, LruMemoryStorage, isTtlStorage } from '@puregram/storage'
export type { KVStorage, TtlStorage, LruMemoryStorageOptions } from '@puregram/storage'
