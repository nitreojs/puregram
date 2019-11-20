import IScene from './scenes/scene';

import { IContext, Middleware } from './types';
import { SceneContext } from './contexts';
import CacheRepository from './cache-repository';
import { SceneRepository, ISceneManagerOptions } from './scene-manager.types';

declare class SceneManager {
  private repository: SceneRepository = new CacheRepository();

  public constructor(rawOptions?: ISceneManagerOptions | IScene[]);

  /**
	 * Adds a scene to the shared list
	 */
  public addScene(scene: IScene): this;
  
  /**
	 * Returns the middleware for embedding
	 */
  public get middleware(): Middleware<IContext>;
  
  /**
	 * Returns the middleware for intercept
	 */
	public get middlewareIntercept(): Middleware<IContext>;
}

export = SceneManager;
