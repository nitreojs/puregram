import type { UpdateKindMap } from '@puregram/api'
import type { CustomUpdate } from 'puregram'

import type { SceneInterface } from './scenes/scene'

/**
 * empty user-augmentable interface. users widen the typed surface of `update.scene.state`
 * by declaration-merging fields onto SceneState:
 *
 *   declare module '@puregram/scenes' {
 *     interface SceneState {
 *       step: number
 *       answers: string[]
 *     }
 *   }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface -- intentionally empty, user-augmentable
export interface SceneState {}

export type AnyUpdate = UpdateKindMap[keyof UpdateKindMap] | CustomUpdate

export interface SceneOptions {
  /** initial scene set; runtime additions go through tg.scenes.add(scene) */
  scenes?: SceneInterface[]
  /**
   * how to derive the storage key per update — defaults to mirroring session's strategy
   * (from.id ?? senderChat.id ?? chat.id). undefined ⇒ no scene attached for this update
   */
  getStorageKey?: (update: AnyUpdate) => string | undefined
  /**
   * predicate to bypass scene reentry for selected updates. when it returns true
   * for an update belonging to a user with an active scene, the update flows to
   * subsequent middleware (and `tg.on(...)` handlers) as if no scene were active.
   * `update.scene` is still attached, so handlers can call `update.scene.leave()`
   * etc. handy for global commands that must work mid-scene (/whoami, /help)
   */
  passthrough?: (update: AnyUpdate) => boolean
}
