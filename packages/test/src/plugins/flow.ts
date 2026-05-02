import type { Telegram } from 'puregram'

import type { TestEnv } from '../env'

import { registerPack } from './registry'

interface WaiterInfo {
  id: number
  kind: string
  registeredAt: number
}

interface FlowHandle {
  /** snapshot of currently armed waiters tracked by the test pack */
  waiters: () => WaiterInfo[]
  /** cancel every armed waiter (delegates to tg.flow.cancelAll) */
  cancelAll: () => void
}

declare module '../env' {
  interface TestEnv {
    flow?: FlowHandle
  }
}

interface FlowRuntime {
  waitFor: (kind: string, options?: unknown) => Promise<unknown>
  prompt: (chat: number | string, text: string, options?: unknown) => Promise<unknown>
  cancelAll: () => void
}

// flow's WaiterRegistry is closed over — wrap waitFor/prompt to mirror arm/settle into
// a local list. `consume(...)` intentionally omitted: ext has no per-waiter resolve,
// and pushing synthetic updates belongs to the actor api
registerPack({
  pluginName: 'flow',
  apply (env: TestEnv, tg: Telegram) {
    const runtime = (tg as unknown as { flow?: FlowRuntime }).flow

    if (runtime === undefined) {
      return
    }

    let nextId = 1
    const tracked = new Map<number, WaiterInfo>()

    const track = <T> (kind: string, promise: Promise<T>) => {
      const id = nextId++
      const info: WaiterInfo = { id, kind, registeredAt: Date.now() }

      tracked.set(id, info)

      const drop = () => {
        tracked.delete(id)
      }

      promise.then(drop, drop)

      return promise
    }

    const originalWaitFor = runtime.waitFor.bind(runtime)
    const originalPrompt = runtime.prompt.bind(runtime)

    runtime.waitFor = (kind: string, options?: unknown) => (
      track(kind, originalWaitFor(kind, options))
    )

    // prompt is a waitFor under the hood — mirror it so cancelAll/waiters reflect the inbound waiter
    runtime.prompt = (chat: number | string, text: string, options?: unknown) => {
      const kind = (options as { kind?: string } | undefined)?.kind ?? 'message'

      return track(kind, originalPrompt(chat, text, options))
    }

    const handle: FlowHandle = {
      waiters () {
        return [...tracked.values()]
      },
      cancelAll () {
        runtime.cancelAll()
      }
    }

    ;(env as unknown as { flow: FlowHandle }).flow = handle
  }
})

export {}
