class StepSceneContext {
  constructor(options) {
    this.stepChanged = false;
    this.context = options.context;
    this.steps = options.steps;
  }

  get firstTime() {
    let { firstTime = true } = this.context.scene.session;

		return firstTime;
  }

  get stepId() {
    return this.context.scene.session.stepId || 0;
  }

  set stepId(stepId) {
    let { session } = this.context.scene;

		session.stepId = stepId;
		session.firstTime = true;

		this.stepChanged = true;
  }

  get current() {
    return this.steps[this.stepId] || null;
  }
  
  async reenter() {
    let { current } = this;

		if (!current) {
			await this.context.scene.leave();

			return;
		}

		this.stepChanged = false;

		await current(this.context);

		if (this.context.scene.lastAction !== 'leave' && !this.stepChanged) {
			this.context.scene.session.firstTime = false;
		}
  }

  async next({ silent = false } = {}) {
    this.stepId += 1;

		if (silent) {
			return;
		}

		await this.reenter();
  }

  async previous({ silent = false } = {}) {
		this.stepId -= 1;

		if (silent) {
			return;
		}

		await this.reenter();
	}
}

module.exports = StepSceneContext;
