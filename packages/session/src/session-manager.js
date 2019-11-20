let { MemoryStorage } = require('./storages')

class SessionManager {
  constructor(options = {}) {
    this.storage = options.storage || (
			new MemoryStorage()
		);

		this.contextKey = options.contextKey || 'session';

		this.getStorageKey = options.getStorageKey || (
      context => String(context.senderId)
    );
  }

  get middleware() {
    let { storage, contextKey, getStorageKey } = this;

		return async (context, next) => {
			let storageKey = getStorageKey(context);

			let changed = false;
			let wrapSession = (targetRaw) => (
				new Proxy(
          { ...targetRaw, $forceUpdate },
          {
            set: (target, prop, value) => {
              changed = true;

              target[prop] = value;

              return true;
            },

            deleteProperty(target, prop) {
              changed = true;

              delete target[prop];

              return true;
            },
          },
        )
			);

			const $forceUpdate = () => {
				if (Object.keys(session).length > 1) {
					changed = false;

					return storage.set(storageKey, session);
				}

				return storage.delete(storageKey);
			};

			let initialSession = await storage.get(storageKey) || {};

			let session = wrapSession(initialSession);

			Object.defineProperty(context, contextKey, {
				get: () => session,
				set: (newSession) => {
					session = wrapSession(newSession);
					changed = true;
				},
			});

			await next();

			if (changed) {
				await $forceUpdate();
			} else {
				await storage.touch(storageKey);
			}
		};
  }
}

module.exports = SessionManager;
