import type { MessageUpdate } from '@puregram/api'

export type MediaGroupEmit = (id: string, messages: MessageUpdate[]) => void

interface Bucket {
  messages: MessageUpdate[]
  timer: ReturnType<typeof setTimeout>
}

export class MediaGroupBuffer {
  private readonly buckets = new Map<string, Bucket>()
  private readonly window: number
  private readonly emit: MediaGroupEmit

  constructor (window: number, emit: MediaGroupEmit) {
    this.window = window
    this.emit = emit
  }

  add (id: string, message: MessageUpdate) {
    const existing = this.buckets.get(id)

    if (existing) {
      existing.messages.push(message)

      return
    }

    const bucket: Bucket = {
      messages: [message],
      timer: setTimeout(() => this.flush(id), this.window)
    }

    this.buckets.set(id, bucket)
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
    this.emit(id, bucket.messages)
  }
}
