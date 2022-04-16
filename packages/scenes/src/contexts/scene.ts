import { SessionContext } from '../types'

import {
  SceneContextOptions,
  SceneContextEnterOptions,
  SceneContextLeaveOptions,

  LastAction
} from './scene.types'

import { SceneInterface } from '../scenes'

export class SceneContext {
  /** Lazy session for submodules */
  public session!: SessionContext

  /** Base namespace for user input */
  public state!: Record<string, any>

  /** Is the scene cancelled? Used in `leaveHandler()` */
  public cancelled = false;

  public lastAction: LastAction = LastAction.NONE;

  private readonly context: SceneContextOptions['context']

  private repository: SceneContextOptions['repository']

  /** Controlled behavior leave */
  public leaving = false;

  public constructor(options: SceneContextOptions) {
    this.context = options.context
    this.repository = options.repository

    this.updateSession()
  }

  /** Returns current scene */
  public get current(): SceneInterface | undefined {
    return this.repository.get(this.session.current)
  }

  /** Enter to scene */
  public async enter(slug: string, options: SceneContextEnterOptions = {}): Promise<void> {
    const scene = this.repository.strictGet(slug)

    const isCurrent: boolean = this.current?.slug === scene.slug

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

    if (options.silent) return

    await scene.enterHandler(this.context)
  }

  /** Reenter to current scene */
  public async reenter(): Promise<void> {
    const { current } = this

    if (!current) {
      throw new Error('There is no active scene to enter')
    }

    await this.enter(current.slug)
  }

  /** Leave from current scene */
  public async leave(options: SceneContextLeaveOptions = {}): Promise<void> {
    const { current } = this

    if (!current) return

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
  public reset(): void {
    delete this.context.session.__scene

    this.updateSession()
  }

  /** Updates session and state is lazy */
  private updateSession(): void {
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
