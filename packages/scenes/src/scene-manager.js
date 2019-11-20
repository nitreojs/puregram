let CacheRepository = require('./cache-repository');
let { SceneContext } = require('./contexts');

class SceneManager {
  constructor(rawOptions = {}) {
    this.repository = new CacheRepository();

    let options = Array.isArray(rawOptions)
      ? { scenes: rawOptions }
      : rawOptions;
    
    if (options.scenes) {
      for (let scene of options.scenes) {
        this.addScene(scene);
      }
    }
  }

  addScene(scene) {
    this.repository.set(scene.slug, scene);

    return this;
  }

  get middleware() {
    return (context, next) => {
      context.scene = new SceneContext({
        context,
        repository: this.repository,
      });

      return next();
    };
  }

  get middlewareIntercept() {
    return (context, next) => {
      if (!context.scene.current) {
        return next();
      }

      return context.scene.reenter();
    };
  }
}

module.exports = SceneManager;
