import { CacheRepository } from './repository'
import type { SceneInterface } from './scenes/scene'

export interface SceneManagerOptions {
  scenes?: SceneInterface[]
}

/**
 * internal registry. exposed via `tg.scenes.{add, has, remove, all}` only —
 * the class itself is package-private (not in src/index.ts exports)
 */
export class SceneManager {
  private readonly repository = new CacheRepository<string, SceneInterface>()

  constructor (options: SceneManagerOptions = {}) {
    if (options.scenes) {
      for (const scene of options.scenes) {
        this.add(scene)
      }
    }
  }

  add (scene: SceneInterface) {
    this.repository.strictSet(scene.slug, scene)

    return this
  }

  remove (slug: string) {
    return this.repository.delete(slug)
  }

  has (slug: string) {
    return this.repository.has(slug)
  }

  get (slug: string) {
    return this.repository.get(slug)
  }

  strictGet (slug: string) {
    return this.repository.strictGet(slug)
  }

  all () {
    return this.repository.values
  }
}
