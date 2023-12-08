import * as Methods from '../../generated/methods'

import { Telegram } from '../../telegram'

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

interface ControllerOptions {
  action: Methods.SendChatActionParams['action']
  params: Optional<Methods.SendChatActionParams, 'chat_id' | 'action'> & CreateActionControllerParams
  context: Context & SendMixin
}

class ChatActionController {
  private abortController = new AbortController()

  action: Methods.SendChatActionParams['action']
  interval: number
  wait: number
  timeout: number

  private context: Context & SendMixin

  constructor (options: ControllerOptions) {
    const { interval = 5_000, wait = 0, timeout = 30_000 } = options.params

    this.action = options.action
    this.interval = interval
    this.wait = wait
    this.timeout = timeout
    this.context = options.context
  }

  started = false

  /** Starts the `sendChatAction(action)` loop until `stop()` is called */
  start () {
    if (this.started) {
      return
    }

    this.started = true

    setImmediate(async () => {
      const start = Date.now()

      if (this.wait > 0) {
        await sleep(this.wait)
      }

      while (!this.abortController.signal.aborted) {
        const result = await this.context.sendChatAction(this.action, { suppress: true })

        await sleep(this.interval)

        // stop if we hit an error
        if (Telegram.isErrorResponse(result)) {
          break
        }

        // stop if we hit the timeout mark
        if (Date.now() - start > this.timeout) {
          break
        }
      }
    })
  }

  /** Stops the loop */
  stop () {
    this.started = false

    this.abortController.abort()
  }
}

class ChatActionMixin {
  /** Creates a controller that when `start()`ed executes `sendChatAction(action)` every `interval` milliseconds until `stop()`ped */
  createActionController (
    action: Methods.SendChatActionParams['action'],
    params: Optional<Methods.SendChatActionParams, 'chat_id' | 'action'> & CreateActionControllerParams = {}
  ) {
    return new ChatActionController({
      action,
      params,
      context: this
    })
  }
}

interface ChatActionMixin extends Context, SendMixin {}

export { ChatActionMixin }
