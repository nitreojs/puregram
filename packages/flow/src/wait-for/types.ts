import type { UpdateKindMap } from '@puregram/api'

export type Filter<U> = (update: U) => boolean

export interface WaitForOptions<K extends keyof UpdateKindMap> {
  filter?: Filter<UpdateKindMap[K]>
  timeout?: number
  nullOnTimeout?: boolean
  consume?: boolean
}

export type WaitForResult<K extends keyof UpdateKindMap, NullOnTimeout extends boolean | undefined> =
  NullOnTimeout extends true ? UpdateKindMap[K] | null : UpdateKindMap[K]
