/** loose `EventEmitter` shape — only `on` is needed, matching node's `EventEmitter` and most node-style emitters */
interface EmitterLike {
  on: (event: string, listener: (...args: unknown[]) => void) => unknown
  off?: (event: string, listener: (...args: unknown[]) => void) => unknown
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => unknown
}

function detach (ee: EmitterLike, event: string, listener: (...args: unknown[]) => void) {
  if (typeof ee.off === 'function') {
    ee.off(event, listener)

    return
  }

  if (typeof ee.removeListener === 'function') {
    ee.removeListener(event, listener)
  }
}

/**
 * adapter for node-style `EventEmitter`s. listens for `event` (default `'text'`), `'end'` and `'error'`;
 * ends gracefully on `end`, propagates `error` to the consumer
 */
export function fromEventEmitter (ee: EmitterLike, event = 'text') {
  const buffer: string[] = []
  const pending: { resolve: (v: IteratorResult<string>) => void, reject: (e: unknown) => void }[] = []

  let done = false
  let error: unknown

  const onText = (...args: unknown[]) => {
    const first = args[0]
    const text = typeof first === 'string' ? first : String(first ?? '')

    if (text.length === 0) {
      return
    }

    const waiter = pending.shift()

    if (waiter) {
      waiter.resolve({ value: text, done: false })

      return
    }

    buffer.push(text)
  }

  const onEnd = () => {
    done = true

    while (pending.length > 0) {
      const waiter = pending.shift()

      waiter?.resolve({ value: undefined, done: true })
    }

    detach(ee, event, onText)
    detach(ee, 'end', onEnd)
    detach(ee, 'error', onError)
  }

  const onError = (err: unknown) => {
    error = err
    done = true

    while (pending.length > 0) {
      const waiter = pending.shift()

      waiter?.reject(err)
    }

    detach(ee, event, onText)
    detach(ee, 'end', onEnd)
    detach(ee, 'error', onError)
  }

  ee.on(event, onText)
  ee.on('end', onEnd)
  ee.on('error', onError)

  const iterable: AsyncIterable<string> = {
    [Symbol.asyncIterator] () {
      return {
        next: () => new Promise<IteratorResult<string>>((resolve, reject) => {
          if (buffer.length > 0) {
            const value = buffer.shift() as string

            resolve({ value, done: false })

            return
          }

          if (error !== undefined) {
            reject(error)

            return
          }

          if (done) {
            resolve({ value: undefined, done: true })

            return
          }

          pending.push({ resolve, reject })
        })
      }
    }
  }

  return iterable
}
