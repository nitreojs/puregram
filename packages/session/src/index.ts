// @puregram/session — transparent persistent session plugin

// side-effect: loads the codegenerated `declare module '@puregram/api'`
// augmentations that attach `session: SessionContext` to every supported update kind.
import './generated/augmentations'

export { session, type SessionExtension } from './session'
export { ttl, TTL_SYM, PROXY_SYM } from './ttl'
export type { TtlData, TtlWrapped } from './ttl'
export { MemoryStorage } from './storage/memory'
export type { SessionStorage, MemoryStorageOptions, MemoryStoreLike } from './storage'
export type { SessionContext, SessionData, SessionOptions, AnyUpdate } from './types'
