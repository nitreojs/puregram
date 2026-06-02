const ZERO_CHANNEL_ID = -1_000_000_000_000

/** coarse mtproto peer kind derivable from a bot api id — `channel` covers both supergroups and broadcast channels */
export type PeerType = 'user' | 'chat' | 'channel'

/** result of {@link parsePeerId} — the bare mtproto id plus its peer kind */
export interface ParsedPeerId {
  /** peer kind the marking decodes to */
  type: PeerType
  /** bare mtproto id, always positive */
  id: number
}

/** thrown when a value can't be a valid telegram peer id */
export class PeerIdError extends Error {
  /** the offending input */
  readonly input: number

  constructor (message: string, input: number) {
    super(message)

    this.name = 'PeerIdError'
    this.input = input
  }
}

function ensureMarked (id: number) {
  if (!Number.isSafeInteger(id) || id === 0 || id === ZERO_CHANNEL_ID) {
    throw new PeerIdError(`invalid bot api peer id: ${id}`, id)
  }
}

/** classify a bot api id and extract its bare mtproto id */
// discriminant union needs explicit annotation so the literal `type` doesn't widen to string
// eslint-disable-next-line local-rules/no-redundant-return-type
export function parsePeerId (botApiId: number): ParsedPeerId {
  ensureMarked(botApiId)

  if (botApiId > 0) {
    return { type: 'user', id: botApiId }
  }

  // -1000000000000 and -999999999999 are consecutive integers, so this split has no gap
  if (botApiId < ZERO_CHANNEL_ID) {
    return { type: 'channel', id: ZERO_CHANNEL_ID - botApiId }
  }

  return { type: 'chat', id: -botApiId }
}

/** convert a bot api id to its bare mtproto id — the form telegram clients render */
export function toMtprotoId (botApiId: number) {
  return parsePeerId(botApiId).id
}

/** derive the peer kind from a bot api id */
export function getPeerType (botApiId: number) {
  return parsePeerId(botApiId).type
}

/** convert a bare mtproto id back to its bot api id, given the peer kind */
export function toBotApiId (mtprotoId: number, type: PeerType) {
  if (!Number.isSafeInteger(mtprotoId) || mtprotoId <= 0) {
    throw new PeerIdError(`invalid mtproto peer id: ${mtprotoId}`, mtprotoId)
  }

  if (type === 'user') {
    return mtprotoId
  }

  if (type === 'chat') {
    return -mtprotoId
  }

  return ZERO_CHANNEL_ID - mtprotoId
}

/** `true` if `id` is a valid bot api user id */
export function isUserId (id: number) {
  return Number.isSafeInteger(id) && id > 0
}

/** `true` if `id` is a valid bot api basic-group id */
export function isChatId (id: number) {
  return Number.isSafeInteger(id) && id < 0 && id > ZERO_CHANNEL_ID
}

/** `true` if `id` is a valid bot api supergroup/channel id */
export function isChannelId (id: number) {
  return Number.isSafeInteger(id) && id < ZERO_CHANNEL_ID
}
