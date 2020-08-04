import {
  ContextInterface,
  SessionContext,
  SessionManagerOptions,

  Middleware
} from './types';

import { MemoryStorage } from './storages';

export class SessionManager<T = {}> {
  protected storage: SessionManagerOptions['storage'];

  protected getStorageKey: SessionManagerOptions['getStorageKey'];

  constructor(options: Partial<SessionManagerOptions<T>> = {}) {
    this.storage = options.storage || new MemoryStorage();

    this.getStorageKey = options.getStorageKey || (
      (context: ContextInterface): string => String(context.senderId)
    );
  }

  /** Returns the middleware for embedding */
  public get middleware(): Middleware<ContextInterface> {
    const { storage, getStorageKey } = this;

    return async (context: ContextInterface, next: Function): Promise<void> => {
      const storageKey = getStorageKey(context);

      let changed: boolean = false;

      const wrapSession = (targetRaw: object): SessionContext => (
        new Proxy<SessionContext>({ ...targetRaw, $forceUpdate }, {
          set: (target: SessionContext, prop: string, value: any): boolean => {
            changed = true;

            target[prop] = value;

            return true;
          },

          deleteProperty: (target: SessionContext, prop: string): boolean => {
            changed = true;

            delete target[prop];

            return true;
          }
        })
      );

      const $forceUpdate: (() => Promise<boolean>) = (): Promise<boolean> => {
        if (Object.keys(session).length > 1) {
          changed = false;

          return storage.set(storageKey, session);
        }

        return storage.delete(storageKey);
      }

      const initialSession: any = await storage.get(storageKey) || {};

      let session: SessionContext = wrapSession(initialSession);

      Object.defineProperty(context, 'session', {
        get: (): SessionContext => session,
        set: (newSession: any): void => {
          session = wrapSession(newSession);
          changed = true;
        }
      });

      await next();

      if (changed) await $forceUpdate();
      else await storage.touch(storageKey);
    };
  }
}
