import type { UpdateKindMap } from '@puregram/api'
import type { KVStorage } from '@puregram/storage'

import { buildKey } from './storage-keys'
import type { PersistedFlow } from './types'

export async function writeRecord (storage: KVStorage<PersistedFlow>, record: PersistedFlow) {
  await storage.set(buildKey(record.chatId, record.fromId, record.kind), record)
}

export async function readRecord (
  storage: KVStorage<PersistedFlow>,
  chatId: number,
  fromId: number | undefined,
  kind: keyof UpdateKindMap
) {
  return storage.get(buildKey(chatId, fromId, kind))
}

export async function deleteRecord (
  storage: KVStorage<PersistedFlow>,
  chatId: number,
  fromId: number | undefined,
  kind: keyof UpdateKindMap
) {
  await storage.delete(buildKey(chatId, fromId, kind))
}

/** writes back the record with attempts++ to mark a validate failure */
export async function bumpAttempts (storage: KVStorage<PersistedFlow>, record: PersistedFlow) {
  const next: PersistedFlow = { ...record, attempts: (record.attempts ?? 0) + 1 }

  await writeRecord(storage, next)
}

export function isExpired (record: PersistedFlow, now: number) {
  return record.expiresAt !== undefined && record.expiresAt < now
}
