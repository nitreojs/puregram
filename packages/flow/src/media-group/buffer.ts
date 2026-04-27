import type { MessageUpdate } from '@puregram/api'

interface Bucket {
  messages: MessageUpdate[]
  promise: Promise<MessageUpdate[]>
  resolve: (messages: MessageUpdate[]) => void
  timer: ReturnType<typeof setTimeout>
}

// promise-based aggregator keyed by `media_group_id`. each `collect(message, window)`
// call adds the message to its bucket, resets the bucket's sliding timer, and returns
// the same promise that resolves with the full message list once the window settles.
//
// callers that hand the same group_id from multiple handler invocations get the same
// resolved array, so handlers can converge on the assembled album without external sync.
export class MediaGroupBuffer {
  private readonly buckets = new Map<string, Bucket>()

  collect (id: string, message: MessageUpdate, window: number) {
    let bucket = this.buckets.get(id)

    if (!bucket) {
      let resolveBucket!: (messages: MessageUpdate[]) => void
      const promise = new Promise<MessageUpdate[]>((resolve) => {
        resolveBucket = resolve
      })

      bucket = {
        messages: [],
        promise,
        resolve: resolveBucket,
        timer: setTimeout(() => this.flush(id), window)
      }

      this.buckets.set(id, bucket)
    } else {
      clearTimeout(bucket.timer)
      bucket.timer = setTimeout(() => this.flush(id), window)
    }

    // dedupe — the same message object can be passed via both the global tg.flow handler
    // and a per-update message.flow.collectMediaGroup() in the same tick
    if (!bucket.messages.includes(message)) {
      bucket.messages.push(message)
    }

    return bucket.promise
  }

  flushAll () {
    for (const id of [...this.buckets.keys()]) {
      this.flush(id)
    }
  }

  private flush (id: string) {
    const bucket = this.buckets.get(id)

    if (!bucket) {
      return
    }

    clearTimeout(bucket.timer)
    this.buckets.delete(id)
    bucket.resolve(bucket.messages)
  }
}
