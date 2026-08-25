import type { UpdateKindMap } from '@puregram/api'
import type { KVStorage } from '@puregram/storage'
import type { Telegram } from 'puregram'

import { FlowKindMismatch } from '../errors'
import type { PromptOptions } from '../prompt'

import type { HandlerRegistry } from './handlers'
import { deleteRecord, writeRecord } from './persist'
import type { PersistedFlow } from './types'

export interface PersistDeps {
  storage: KVStorage<PersistedFlow>
  handlers: HandlerRegistry
  defaultTtl: number | undefined
}

/** subset of WaitForOptions accepted on the persistent path — validate/transform live on the handle */
export interface PersistentWaitForOptions {
  id: string
  payload?: unknown
  ttl?: number
  chatId?: number
  fromId?: number
}

export async function persistentWaitFor<K extends keyof UpdateKindMap> (
  deps: PersistDeps,
  kind: K,
  options: PersistentWaitForOptions
) {
  const handle = deps.handlers.get(options.id)

  if (handle !== undefined && handle.kind !== kind) {
    throw new FlowKindMismatch(options.id, handle.kind as string, kind as string)
  }

  if (options.chatId === undefined) {
    throw new Error('flow.waitFor({ id }) requires options.chatId — pass it explicitly')
  }

  const ttl = options.ttl ?? deps.defaultTtl
  const now = Date.now()
  const record: PersistedFlow = {
    id: options.id,
    kind,
    chatId: options.chatId,
    fromId: options.fromId,
    payload: options.payload,
    createdAt: now
  }

  if (ttl !== undefined) {
    record.expiresAt = now + ttl
  }

  await writeRecord(deps.storage, record)
}

/** subset of PromptOptions accepted on the persistent path — validate/transform live on the handle */
export interface PersistentPromptOptions<K extends keyof UpdateKindMap = 'message'>
  extends Pick<PromptOptions<K>, 'kind' | 'from' | 'reply_markup'> {
  id: string
  payload?: unknown
  ttl?: number
}

export async function persistentPrompt<K extends keyof UpdateKindMap = 'message'> (
  tg: Telegram,
  deps: PersistDeps,
  chat: number | string,
  text: string,
  options: PersistentPromptOptions<K>
) {
  const kind = (options.kind ?? 'message') as K
  const handle = deps.handlers.get(options.id)

  if (handle !== undefined && handle.kind !== kind) {
    throw new FlowKindMismatch(options.id, handle.kind as string, kind as string)
  }

  if (typeof chat !== 'number') {
    throw new Error(`flow.prompt({ id }) requires a numeric chat id (got ${typeof chat})`)
  }

  const ttl = options.ttl ?? deps.defaultTtl
  const now = Date.now()
  const record: PersistedFlow = {
    id: options.id,
    kind,
    chatId: chat,
    fromId: options.from,
    payload: options.payload,
    createdAt: now
  }

  if (ttl !== undefined) {
    record.expiresAt = now + ttl
  }

  // arming after the send would drop a reply that lands while it is still in flight
  await writeRecord(deps.storage, record)

  try {
    if (options.reply_markup !== undefined) {
      // bot api markup shape uses snake_case keys
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/naming-convention
      const sendParams: Record<string, unknown> = { reply_markup: options.reply_markup }

      await tg.send(chat, text, sendParams)
    } else {
      await tg.send(chat, text)
    }
  } catch (error) {
    await deleteRecord(deps.storage, chat, options.from, kind)

    throw error
  }
}
