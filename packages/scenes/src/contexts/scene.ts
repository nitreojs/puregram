import type { SceneInterface } from '../scenes/scene'
import type { SceneState } from '../types'

import {
  LastAction,
  type SceneContextEnterOptions,
  type SceneContextLeaveOptions,
  type SceneContextOptions,
  type ScenePayload,
  type SceneSessionState
} from './scene.types'

export type { ScenePayload, SceneSessionState }

/**
 * per-update scene controller — attached as `update.scene` by the scenes plugin.
 * methods mutate `update.session.__scene`, which the session proxy flushes on dispatch end
 */
export class SceneContext<S = SceneState> {
  /** lazy proxy bound to payload.session.__scene */
  session!: SceneSessionState<S>
  /** lazy proxy bound to payload.session.__scene.state */
  state!: S
  /** set during leave(), surfaced inside the scene's leaveHandler */
  cancelled = false
  lastAction: LastAction = LastAction.None
  /** controlled-behavior leave flag — mirrors v2 */
  leaving = false

  private readonly payload: ScenePayload<S>
  private readonly manager: SceneContextOptions<S>['manager']

  constructor (options: SceneContextOptions<S>) {
    this.payload = options.payload
    this.manager = options.manager
    this.updateSession()
  }

  /** the currently-active scene resolved from session.__scene.current, or undefined */
  get current (): SceneInterface | undefined {
    const slug = this.session.current

    if (slug === undefined) {
      return undefined
    }

    return this.manager.get(slug)
  }

  async enter (slug: string, options: SceneContextEnterOptions<S> = {}) {
    const scene = this.manager.strictGet(slug)
    const isCurrent = this.current?.slug === scene.slug

    if (!isCurrent) {
      if (!this.leaving) {
        const leaveOptions: SceneContextLeaveOptions = {}

        if (options.silent !== undefined) {
          leaveOptions.silent = options.silent
        }

        await this.leave(leaveOptions)
      }

      if (this.leaving) {
        this.leaving = false
        this.reset()
      }
    }

    this.lastAction = LastAction.Enter
    this.session.current = scene.slug
    Object.assign(this.state as object, options.state ?? {})

    if (options.silent) {
      return
    }

    await scene.enterHandler(this.toHandlerPayload())
  }

  async reenter () {
    const { current } = this

    if (!current) {
      throw new Error('there is no active scene to enter')
    }

    await this.enter(current.slug)
  }

  async leave (options: SceneContextLeaveOptions = {}) {
    const { current } = this

    if (!current) {
      return
    }

    this.leaving = true
    this.lastAction = LastAction.Leave

    if (!options.silent) {
      this.cancelled = options.cancelled ?? false
      await current.leaveHandler(this.toHandlerPayload())
    }

    if (this.leaving) {
      this.reset()
    }

    this.leaving = false
    this.cancelled = false
  }

  /** drops session.__scene; subsequent reads see a fresh empty proxy */
  reset () {
    delete this.payload.session.__scene
    this.updateSession()
  }

  private toHandlerPayload () {
    // structural unwrapping — runtime payload is the wrapped update with session + scene attached;
    // handler sees a SceneHandlerPayload view of the same object
    return this.payload as unknown as Parameters<SceneInterface['enterHandler']>[0]
  }

  private updateSession () {
    const sessionTarget: SceneSessionState<S> = this.payload.session.__scene ?? {}

    this.session = new Proxy<SceneSessionState<S>>(sessionTarget, {
      set: (target, key, value: unknown) => {
        const writable = target as Record<string, unknown>

        writable[key as string] = value
        this.payload.session.__scene = target

        return true
      }
    })

    const stateTarget: Partial<S> & object = this.session.state ?? {}

    // the store fills in field by field, but handlers read it as the fully-typed `S` they declared
    this.state = new Proxy<Partial<S> & object>(stateTarget, {
      set: (target, key, value: unknown) => {
        const writable = target as Record<string, unknown>

        writable[key as string] = value
        this.session.state = target

        return true
      }
    }) as S
  }
}
