import { Composer as MiddlewareComposer } from 'middleware-io'

import { Context } from '../../contexts/context'

// @ts-expect-error
export class Composer<T extends Context> extends MiddlewareComposer<T> {
  /**
   * Create new `Composer` instance
   */
  static builder<T extends Context>(): Composer<T> {
    return new Composer<T>()
  }
}
