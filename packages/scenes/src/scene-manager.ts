import { SceneInterface } from './scenes'

import { ContextInterface, Middleware } from './types'
import { SceneContext } from './contexts'
import { CacheRepository } from './cache-repository'
import { SceneRepository, SceneManagerOptions } from './scene-manager.types'

export class SceneManager {
  private repository: SceneRepository = new CacheRepository();

  constructor(rawOptions: SceneManagerOptions | SceneInterface[] = {}) {
    const options = Array.isArray(rawOptions)
      ? { scenes: rawOptions }
      : rawOptions

    if (options.scenes) {
      this.addScenes(options.scenes)
    }
  }

  /** Checks for has a scene */
  hasScene(slug: string): boolean {
    return this.repository.has(slug)
  }

  /** Adds scenes to the repository */
  addScenes(scenes: SceneInterface[]): this {
    for (const scene of scenes) {
      this.repository.set(scene.slug, scene)
    }

    return this
  }

  /** Returns the middleware for embedding */
  get middleware(): Middleware<ContextInterface> {
    return (context: ContextInterface, next: Function): Promise<void> => {
      context.scene = new SceneContext({
        context,
        repository: this.repository
      })

      return next()
    }
  }

  /** Returns the middleware for intercept */
  get middlewareIntercept(): Middleware<ContextInterface> {
    return (context: ContextInterface, next: Function): Promise<void> => {
      if (!context.scene.current) {
        return next()
      }

      return context.scene.reenter()
    }
  }
}
