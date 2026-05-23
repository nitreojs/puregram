import { ApiError, type Telegram } from 'puregram'

import type { SubscriberStore } from './subscribers'

export interface BroadcastSource {
  /** chat the original message lives in (the admin's chat with the bot) */
  chatId: number
  /** message id to copy */
  messageId: number
}

export interface BroadcastProgress {
  sent: number
  removed: number
  failed: number
  total: number
}

export interface BroadcastOptions {
  telegram: Telegram
  subscribers: SubscriberStore
  source: BroadcastSource
  /** how many copyMessage calls fly concurrently — throttler smooths to 30/sec globally */
  concurrency?: number
  /** invoked after every `progressEveryN` successes; awaited so the call counts toward rate limits */
  onProgress?: (progress: BroadcastProgress) => Promise<void> | void
  progressEveryN?: number
}

const DEFAULT_CONCURRENCY = 25
const DEFAULT_PROGRESS_EVERY = 25

/** treat these api errors as "user is gone" and prune the subscriber */
function isPermanentDeliveryError (error: unknown) {
  if (!(error instanceof ApiError)) {
    return false
  }

  if (error.code === 403) {
    return true
  }

  if (error.code === 400) {
    const message = error.message.toLowerCase()

    return (
      message.includes('chat not found')
      || message.includes('user is deactivated')
      || message.includes('peer_id_invalid')
    )
  }

  return false
}

/** fan out `source` to every subscriber using copyMessage, pruning gone users as we go */
export async function broadcast (options: BroadcastOptions) {
  const {
    telegram,
    subscribers,
    source,
    concurrency = DEFAULT_CONCURRENCY,
    onProgress,
    progressEveryN = DEFAULT_PROGRESS_EVERY
  } = options

  const ids = await subscribers.list()
  const queue = [...ids]
  const result: BroadcastProgress = { sent: 0, removed: 0, failed: 0, total: ids.length }

  const reportProgress = async () => {
    if (onProgress === undefined) {
      return
    }

    await onProgress({ ...result })
  }

  const worker = async () => {
    while (queue.length > 0) {
      const userId = queue.shift()

      if (userId === undefined) {
        return
      }

      try {
        await telegram.api.copyMessage({
          chat_id: userId,
          from_chat_id: source.chatId,
          message_id: source.messageId
        })

        result.sent++
      } catch (error) {
        if (isPermanentDeliveryError(error)) {
          await subscribers.remove(userId)
          result.removed++
        } else {
          result.failed++
        }
      }

      if ((result.sent + result.removed + result.failed) % progressEveryN === 0) {
        await reportProgress()
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, ids.length) }, worker)

  await Promise.all(workers)
  await reportProgress()

  return result
}
