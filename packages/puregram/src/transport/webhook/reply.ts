import { AsyncLocalStorage } from 'node:async_hooks'

export interface ReplyPayload {
  method: string
  params: Record<string, unknown>
}

/**
 * one-shot slot threaded through dispatch via AsyncLocalStorage. the first
 * api call in a handler claims the slot; the webhook handler reads `payload`
 * and writes it as the json body of the 200 response, skipping the http call
 */
export class ReplySlot {
  consumed = false
  payload: ReplyPayload | undefined
  readonly claimed: Promise<void>

  private resolveClaimed: (() => void) | undefined

  constructor () {
    this.claimed = new Promise<void>((resolve) => {
      this.resolveClaimed = resolve
    })
  }

  tryClaim (method: string, params: Record<string, unknown>) {
    if (this.consumed) {
      return false
    }

    this.consumed = true
    this.payload = { method, params }
    this.resolveClaimed?.()

    return true
  }
}

export const replyAls = new AsyncLocalStorage<ReplySlot>()
