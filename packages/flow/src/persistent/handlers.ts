import type { UpdateKindMap } from '@puregram/api'

import type { FlowHandleConfig } from './types'

interface NormalizedHandle<K extends keyof UpdateKindMap = keyof UpdateKindMap> {
  kind: K
  config: FlowHandleConfig<K, unknown>
}

/** boot-time registry of named persistent flow handlers */
export class HandlerRegistry {
  // erasure intentional: heterogeneous Map<id, FlowHandleConfig<K, T>> for varying K
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional erasure across update kinds
  private readonly handlers = new Map<string, NormalizedHandle<any>>()

  register<K extends keyof UpdateKindMap, T> (id: string, config: FlowHandleConfig<K, T>) {
    if (this.handlers.has(id)) {
      throw new Error(`flow.handle('${id}') already registered`)
    }

    const kind = (config.kind ?? 'message') as K

    this.handlers.set(id, { kind, config: { ...config, kind } as FlowHandleConfig<K, unknown> })
  }

  get (id: string) {
    return this.handlers.get(id)?.config
  }

  has (id: string) {
    return this.handlers.has(id)
  }

  size () {
    return this.handlers.size
  }
}
