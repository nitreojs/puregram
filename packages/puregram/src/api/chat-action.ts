import type {
  ActionControllerLike,
  ActionControllerParams,
  SendChatActionParams,
  TelegramLike
} from '@puregram/api'

// minimal slice the controller needs — just enough to fire sendChatAction
type ChatActionSender = Pick<TelegramLike, 'api'>

// abortable delay that resolves (never rejects) on abort, so the loop falls
// through to its `signal.aborted` check instead of throwing
function delay (ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve()

      return
    }

    const onAbort = () => {
      clearTimeout(timer)
      resolve()
    }

    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)

    signal.addEventListener('abort', onAbort, { once: true })
  })
}

/**
 * re-sends `sendChatAction(action)` on an interval until `stop()` is called —
 * telegram clears the action after ~5 seconds, so a long task needs it refreshed
 */
export class ChatActionController implements ActionControllerLike {
  /** the chat action being sent — reassign to switch it mid-flight */
  action: SendChatActionParams['action']
  /** interval between calls, in milliseconds */
  interval: number
  /** initial delay before the first call, in milliseconds */
  wait: number
  /** timeout in milliseconds; `0` disables it */
  timeout: number

  started = false

  private abortController?: AbortController
  private readonly tg: ChatActionSender
  private readonly chatId: number | string
  private readonly params: Omit<SendChatActionParams, 'chat_id' | 'action'>

  constructor (
    tg: ChatActionSender,
    chatId: number | string,
    action: SendChatActionParams['action'],
    options: ActionControllerParams = {}
  ) {
    const { interval = 5_000, wait = 0, timeout = 0, ...params } = options

    this.tg = tg
    this.chatId = chatId
    this.action = action
    this.interval = interval
    this.wait = wait
    this.timeout = timeout
    this.params = params
  }

  /** starts the `sendChatAction(action)` loop until `stop()` is called */
  start () {
    if (this.started) {
      return
    }

    this.started = true

    const abortController = new AbortController()

    this.abortController = abortController

    // loop() swallows its own errors; the catch only satisfies no-floating-promises
    this.loop(abortController.signal).catch(() => undefined)
  }

  /** stops the loop */
  stop () {
    if (!this.started) {
      return
    }

    this.started = false
    this.abortController?.abort()
  }

  private async loop (signal: AbortSignal) {
    const startedAt = Date.now()

    if (this.wait > 0) {
      await delay(this.wait, signal)
    }

    while (!signal.aborted) {
      try {
        await this.tg.api.sendChatAction({ chat_id: this.chatId, action: this.action, ...this.params })
      } catch {
        // bail on api errors — chat gone, bot kicked, bad action, etc
        break
      }

      if (this.timeout !== 0 && Date.now() - startedAt > this.timeout) {
        break
      }

      await delay(this.interval, signal)
    }

    this.started = false
  }
}
