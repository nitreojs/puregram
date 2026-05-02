import type { World } from '../../world/world'

interface ReactionType {
  type: string
  emoji?: string
}

export function setMessageReaction (world: World, params: Record<string, unknown>) {
  const chat = world.findChat(params.chat_id as number | string)

  if (chat === undefined) {
    return true
  }

  const messageId = params.message_id as number
  const msg = chat.messages.find(m => m.message_id === messageId)

  if (msg === undefined) {
    return true
  }

  const reactions = (params.reaction as ReactionType[] | undefined) ?? []
  const emojis = reactions
    .filter(r => r.type === 'emoji' && r.emoji !== undefined)
    .map(r => r.emoji as string)

  msg.applyReaction(world.bot.id, emojis)

  return true
}
