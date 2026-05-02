import type { World } from '../../world/world'

export function pinChatMessage (world: World, params: Record<string, unknown>) {
  const chat = world.findChat(params.chat_id as number | string)

  if (chat === undefined) {
    return true
  }

  const messageId = params.message_id as number
  const msg = chat.messages.find(m => m.message_id === messageId)

  if (msg !== undefined) {
    chat.pinTop(msg)
  }

  return true
}

export function unpinChatMessage (world: World, params: Record<string, unknown>) {
  const chat = world.findChat(params.chat_id as number | string)

  if (chat === undefined) {
    return true
  }

  const messageId = params.message_id

  if (typeof messageId === 'number') {
    chat.unpin(messageId)
  }

  return true
}

export function unpinAllChatMessages (world: World, params: Record<string, unknown>) {
  world.findChat(params.chat_id as number | string)?.unpinAll()

  return true
}
