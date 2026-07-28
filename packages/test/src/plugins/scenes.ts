import type { Telegram } from 'puregram'

import type { TestUser } from '../actors/user'
import type { TestEnv } from '../env'

import { registerPack } from './registry'
import { sessionKeyOfUser } from './session-key'

interface SessionExtensionRuntime {
  get: (key: string) => Promise<unknown>
  set: (key: string, value: unknown) => Promise<void>
  delete: (key: string) => Promise<void>
}

interface SceneStateRecord {
  current?: string
  state?: unknown
  stepId?: number
  firstTime?: boolean
}

interface SessionRecord {
  [key: string]: unknown
  __scene?: SceneStateRecord
}

interface SceneCurrent {
  sceneId: string
  step: number
  payload: unknown
}

interface SceneHistoryEntry {
  sceneId: string
  step: number
  enteredAt: number
}

interface ScenesHandle {
  current: (user: TestUser) => Promise<SceneCurrent | null>
  enter: (user: TestUser, sceneId: string, opts?: { step?: number, payload?: unknown }) => Promise<void>
  leave: (user: TestUser) => Promise<void>
  history: (user: TestUser) => SceneHistoryEntry[]
}

declare module '../env' {
  interface TestEnv {
    scenes?: ScenesHandle
  }
}

const isObject = (value: unknown): value is SessionRecord => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
)

registerPack({
  pluginName: 'scenes',
  apply (env: TestEnv, tg: Telegram) {
    const sessionExt = (tg as unknown as { session?: SessionExtensionRuntime }).session

    if (sessionExt === undefined) {
      return
    }

    const history = new Map<TestUser, SceneHistoryEntry[]>()

    const readSession = async (key: string) => {
      const stored = await sessionExt.get(key)

      return isObject(stored) ? stored : {} as SessionRecord
    }

    const writeSession = async (key: string, data: SessionRecord) => {
      if (Object.keys(data).length === 0) {
        await sessionExt.delete(key)

        return
      }

      await sessionExt.set(key, data)
    }

    const handle: ScenesHandle = {
      async current (user) {
        const key = sessionKeyOfUser(user)
        const data = await readSession(key)
        const scene = data.__scene

        if (scene?.current === undefined) {
          return null
        }

        return {
          sceneId: scene.current,
          step: scene.stepId ?? 0,
          payload: scene.state
        }
      },

      async enter (user, sceneId, opts) {
        const key = sessionKeyOfUser(user)
        const data = await readSession(key)
        const sceneState: SceneStateRecord = { current: sceneId }

        if (opts?.step !== undefined) {
          sceneState.stepId = opts.step
        }

        if (opts?.payload !== undefined) {
          sceneState.state = opts.payload
        }

        data.__scene = sceneState

        await writeSession(key, data)

        const list = history.get(user) ?? []

        list.push({
          sceneId,
          step: opts?.step ?? 0,
          enteredAt: Date.now()
        })

        history.set(user, list)
      },

      async leave (user) {
        const key = sessionKeyOfUser(user)
        const data = await readSession(key)

        if (data.__scene === undefined) {
          return
        }

        delete data.__scene

        await writeSession(key, data)
      },

      history (user) {
        return history.get(user) ?? []
      }
    }

    env.scenes = handle

    const storageView = env.ensureStorage()

    storageView.register('scenes', handle)
  }
})

export {}
