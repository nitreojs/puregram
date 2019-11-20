let { StepSceneContext } = require('../contexts');

class StepScene {
  constructor(slug, rawOptions) {
    let options = Array.isArray(rawOptions)
			? { steps: rawOptions }
      : rawOptions;
    
    this.slug = slug;
    this.steps = options.steps;
    this.onEnterHandler = options.enterHandler || (() => {});
    this.onLeaveHandler = options.leaveHandler || (() => {});
  }

  async enterHandler(context) {
    context.scene.step = new StepSceneContext({
      context,
      steps: this.steps,
    });

    await this.onEnterHandler(context);

    if (context.scene.lastAction !== 'leave') {
      await context.scene.step.reenter();
    }
  }

  leaveHandler(context) {
    return this.onLeaveHandler(context);
  }
}

module.exports = StepScene;
