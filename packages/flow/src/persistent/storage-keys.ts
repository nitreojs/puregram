import type { UpdateKindMap } from '@puregram/api'

const UNSCOPED = '*'

interface ParsedKey {
  chatId: number
  fromId: number | undefined
  kind: keyof UpdateKindMap
}

/** key shape for the persistent storage: one open prompt per (chat, user, kind) triple */
export function buildKey (chatId: number, fromId: number | undefined, kind: keyof UpdateKindMap) {
  return `${chatId}:${fromId ?? UNSCOPED}:${kind as string}`
}

/** inverse of buildKey, returning undefined for malformed input */
// eslint-disable-next-line local-rules/no-redundant-return-type -- explicit `| undefined` documents the contract
export function parseKey (key: string): ParsedKey | undefined {
  const parts = key.split(':')

  if (parts.length !== 3) {
    return undefined
  }

  const [chatRaw, fromRaw, kindRaw] = parts as [string, string, string]
  const chatId = Number(chatRaw)

  if (chatRaw.length === 0 || !Number.isFinite(chatId)) {
    return undefined
  }

  if (fromRaw !== UNSCOPED && (fromRaw.length === 0 || !Number.isFinite(Number(fromRaw)))) {
    return undefined
  }

  return {
    chatId,
    fromId: fromRaw === UNSCOPED ? undefined : Number(fromRaw),
    kind: kindRaw as keyof UpdateKindMap
  }
}
