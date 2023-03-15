import { Inspectable } from 'inspectable'
import { Composer as MiddlewareComposer } from 'middleware-io'

import { Context } from '../../contexts/context'

@Inspectable()
// @ts-expect-error Composer does not like MiddlewareComposer...
export class Composer<T extends Context> extends MiddlewareComposer<T> {
  /**
   * Create new `Composer` instance
   */
  static builder<T extends Context> (): Composer<T> {
    return new Composer<T>()
  }
}
