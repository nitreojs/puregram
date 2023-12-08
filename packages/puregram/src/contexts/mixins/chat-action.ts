import { Telegram } from '../../telegram'

import * as Methods from '../../generated/methods'

import { Optional } from '../../types/types'
import { sleep } from '../../utils/helpers'

import { Context } from '../context'

import { SendMixin } from './send'

interface CreateActionControllerParams {
  /**
   * Interval between `sendChatAction` calls, in milliseconds
   * @default 5000
   */
  interval?: number

  /**
   * Initial wait before the first cycle of `sendChatAction` calls, in milliseconds
   * @default 0
   */
  wait?: number

  /**
   * Timeout for `sendChatAction` calls, in milliseconds
   * @default 30000
   */
  timeout?: number
}

class ChatActionMixin {
  /** Creates controller that sends `action` every `interval` milliseconds until `abort()`ed */
  createActionController (
    action: Methods.SendChatActionParams['action'],
    params: Optional<Methods.SendChatActionParams, 'chat_id' | 'action'> & CreateActionControllerParams = {}
  ) {
    const { interval = 5_000, wait = 0, timeout = 30_000 } = params

    const controller = new AbortController()

    setImmediate(async () => {
      const start = Date.now()

      if (wait > 0) {
        await sleep(wait)
      }

      while (!controller.signal.aborted) {
        const result = await this.sendChatAction(action, { suppress: true })

        await sleep(interval)

        // stop if we hit an error
        if (Telegram.isErrorResponse(result)) {
          break
        }

        // stop if we hit the timeout mark
        if (Date.now() - start > timeout) {
          break
        }
      }
    })

    return controller
  }
}

interface ChatActionMixin extends Context, SendMixin {}

export { ChatActionMixin }
