// side-effect: codegen'd augmentations attaching `session: SessionContext` to every update kind
import './generated/augmentations'

export { session, type SessionExtension } from './session'
export { ttl, TTL_SYM, PROXY_SYM } from './ttl'
export type { TtlData, TtlWrapped } from './ttl'
export type { SessionContext, SessionData, SessionOptions, AnyUpdate } from './types'

// re-export from @puregram/storage so consumers don't have to pull it in directly
export { MemoryStorage, LruMemoryStorage, isTtlStorage } from '@puregram/storage'
export type { KVStorage, TtlStorage, LruMemoryStorageOptions } from '@puregram/storage'
