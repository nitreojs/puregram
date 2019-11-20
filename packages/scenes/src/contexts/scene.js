

class SceneContext {
  constructor(options) {
    this.session = null;
    this.state = null;
    this.canceled = false;
    this.lastAction = 'none';
    this.leaved = false;

    this.context = options.context;
    this.repository = options.repository;

    this.updateSession();
  }

  get current() {
    return this.repository.get(this.session.current);
  }

  async enter(slug, options = {}) {
    let scene = this.repository.strictGet(slug);

		let { current } = this;

		let isNotCurrent = current !== null && current.slug !== scene.slug;

		if (!this.leaved && isNotCurrent) {
			await this.leave({
				silent: options.silent,
			});
		}

		if (this.leaved && isNotCurrent) {
			this.leaved = false;

			this.reset();
		}

		this.lastAction = 'enter';

		this.session.current = scene.slug;
		Object.assign(this.state, options.state || {});

		if (options.silent) {
			return;
		}

		await scene.enterHandler(this.context);
  }

  async reenter() {
    let { current } = this;

		if (!current) {
			throw new Error('There is no active scene to enter');
		}

		await this.enter(current.slug);
  }

  async leave(options = {}) {
    let { current } = this;

		if (!current) {
			return;
		}

		this.leaved = true;
		this.lastAction = 'leave';

		if (!options.silent) {
			this.canceled = options.canceled !== undefined
				? options.canceled
				: false;

			await current.leaveHandler(this.context);
		}

		if (this.leaved) {
			this.reset();
		}

		this.leaved = false;
		this.canceled = false;
  }

  reset() {
    delete this.context.session.__scene;

		this.updateSession();
  }

  updateSession() {
    this.session = new Proxy(
      this.context.session.__scene || {},
      {
        set: (target, prop, value) => {
          target[prop] = value;

          this.context.session.__scene = target;

          return true;
        },
      },
    );

		this.state = new Proxy(
      this.session.state || {},
      {
        set: (target, prop, value) => {
          target[prop] = value;

          this.session.state = target;

          return true;
        },
      },
    );
  }
}

module.exports = SceneContext;
