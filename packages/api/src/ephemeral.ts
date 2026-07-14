import type { TelegramReplyParameters } from './generated/types'

interface EphemeralMessageLike {
  ephemeral_message_id?: number
  receiver_user?: { id: number }
  from?: { id: number, is_bot: boolean }
  chat?: { id: number | string }
}

// on an incoming ephemeral command `receiver_user` is the BOT (it received the command),
// while `from` is the human; on the bot's own sent messages it is the inverse — the
// ephemeral counterparty is always the non-bot side
function nonBotParty (raw: EphemeralMessageLike) {
  if (raw.from !== undefined && !raw.from.is_bot) {
    return raw.from.id
  }

  return raw.receiver_user?.id
}

interface EphemeralSendOverrides {
  receiver_user_id?: number
  reply_parameters?: TelegramReplyParameters
  /** pass `false` to skip ephemeral auto-injection and send a regular message */
  ephemeral?: boolean
}

/**
 * ephemeral auto-injection for send-family shortcuts: an incoming ephemeral message can only
 * be answered ephemerally (within 15s, authorized by `reply_parameters.ephemeral_message_id`),
 * so sends from such a context fill `receiver_user_id` + the ephemeral reply anchor.
 * explicit call-site values win; `ephemeral: false` opts out; non-ephemeral contexts
 * contribute nothing. the flag itself never reaches the wire — `undefined` drops at
 * serialization, shadowing the value the params spread carried
 */
export function ephemeralSendParams (raw: EphemeralMessageLike, params: EphemeralSendOverrides) {
  const scrub = 'ephemeral' in params ? { ephemeral: undefined } : {}

  if (raw.ephemeral_message_id == null || params.ephemeral === false) {
    return scrub
  }

  const receiver = params.receiver_user_id ?? nonBotParty(raw)

  return {
    ...scrub,
    ...(receiver === undefined ? {} : { receiver_user_id: receiver }),
    reply_parameters: { ephemeral_message_id: raw.ephemeral_message_id, ...params.reply_parameters }
  }
}

/**
 * the target triple the `editEphemeralMessage*` / `deleteEphemeralMessage` twins require;
 * `undefined` when the wrapped message is not ephemeral (or lacks a resolvable receiver)
 */
export function ephemeralTarget (raw: EphemeralMessageLike) {
  if (raw.ephemeral_message_id == null || raw.chat === undefined) {
    return undefined
  }

  const receiver = nonBotParty(raw)

  if (receiver === undefined) {
    return undefined
  }

  return {
    chat_id: raw.chat.id,
    receiver_user_id: receiver,
    ephemeral_message_id: raw.ephemeral_message_id
  }
}

/**
 * callback-query sends opt into ephemeral by passing `receiver_user_id` — only then does the
 * query id auto-fill as the authorization token (a blanket fill would make every send ephemeral)
 */
export function callbackEphemeralParams (
  queryId: string,
  params: EphemeralSendOverrides & { callback_query_id?: string }
) {
  return params.receiver_user_id !== undefined && params.callback_query_id === undefined
    ? { callback_query_id: queryId }
    : {}
}
