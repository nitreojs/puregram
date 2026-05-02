import type { Telegram } from 'puregram'

import type { TestEnv } from '../env'

export interface PackFactory {
  pluginName: string
  apply: (env: TestEnv, tg: Telegram) => void
}

const REGISTRY: PackFactory[] = []

export function registerPack (factory: PackFactory) {
  REGISTRY.push(factory)
}

export function applyPacks (env: TestEnv, tg: Telegram) {
  for (const factory of REGISTRY) {
    if (tg.has(factory.pluginName)) {
      factory.apply(env, tg)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function __clearPacksForTesting () {
  REGISTRY.length = 0
}
