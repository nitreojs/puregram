import { SceneInterface } from './scenes';
import { CacheRepository } from './cache-repository';

export type SceneRepository = CacheRepository<string, SceneInterface>;

export interface SceneManagerOptions {
  /** Scenes on the interface SceneInterface */
  scenes?: SceneInterface[];
}
