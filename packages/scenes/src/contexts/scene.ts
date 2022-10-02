import { SessionContext } from '../types'

import {
  SceneContextOptions,
  SceneContextEnterOptions,
  SceneContextLeaveOptions,

  LastAction
} from './scene.types'

export class SceneContext<S extends Record<string, unknown> = Record<string, any>> {
  /** Lazy session for submodules */
  session!: SessionContext
  /** Base namespace for user input */
  state!: S
  /** Is the scene cancelled? Used in `leaveHandler()` */
  cancelled = false
  lastAction: LastAction = LastAction.NONE
  /** Controlled behavior leave */
  leaving = false

  private readonly context: SceneContextOptions['context']
  private repository: SceneContextOptions['repository']

  constructor (options: SceneContextOptions) {
    this.context = options.context
    this.repository = options.repository

    this.updateSession()
  }

  /** Returns current scene */
  get current () {
    return this.repository.get(this.session.current)
  }

  /** Enter to scene */
  async enter (slug: string, options: SceneContextEnterOptions<S> = {}) {
    const scene = this.repository.strictGet(slug)

    const isCurrent = this.current?.slug === scene.slug

    if (!isCurrent) {
      if (!this.leaving) {
        await this.leave({
          silent: options.silent
        })
      }

      if (this.leaving) {
        this.leaving = false

        this.reset()
      }
    }

    this.lastAction = LastAction.ENTER

    this.session.current = scene.slug

    Object.assign(this.state, options.state || {})

    if (options.silent) {
      return
    }

    await scene.enterHandler(this.context)
  }

  /** Reenter to current scene */
  async reenter () {
    const { current } = this

    if (!current) {
      throw new Error('there is no active scene to enter')
    }

    await this.enter(current.slug)
  }

  /** Leave from current scene */
  async leave (options: SceneContextLeaveOptions = {}) {
    const { current } = this

    if (!current) {
      return
    }

    this.leaving = true
    this.lastAction = LastAction.LEAVE

    if (!options.silent) {
      this.cancelled = options.cancelled ?? false

      await current.leaveHandler(this.context)
    }

    if (this.leaving) this.reset()

    this.leaving = false
    this.cancelled = false
  }

  /** Reset state/session */
  reset () {
    delete this.context.session.__scene

    this.updateSession()
  }

  /** Updates session and state is lazy */
  private updateSession () {
    this.session = new Proxy(this.context.session.__scene || {}, {
      set: (target, prop, value): boolean => {
        target[prop] = value

        this.context.session.__scene = target

        return true
      }
    })

    this.state = new Proxy(this.session.state || {}, {
      set: (target, prop, value): boolean => {
        target[prop] = value

        this.session.state = target

        return true
      }
    })
  }
}
