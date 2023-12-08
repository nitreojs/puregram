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
}

class ChatActionMixin {
  /** Creates controller that sends `action` every `interval` milliseconds until `abort()`ed */
  createActionController (
    action: Methods.SendChatActionParams['action'],
    params: Optional<Methods.SendChatActionParams, 'chat_id' | 'action'> & CreateActionControllerParams = {}
  ) {
    const { interval = 5000, wait = 0 } = params

    const controller = new AbortController()

    setImmediate(async () => {
      if (wait > 0) {
        await sleep(wait)
      }

      while (!controller.signal.aborted) {
        const result = await this.sendChatAction(action, { suppress: true })

        await sleep(interval)

        if (Telegram.isErrorResponse(result)) {
          break
        }
      }
    })

    return controller
  }
}

interface ChatActionMixin extends Context, SendMixin {}

export { ChatActionMixin }
