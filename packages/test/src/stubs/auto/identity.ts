import type { World } from '../../world/world'

export function getMe (world: World) {
  return world.bot
}

export function getChat (_world: World, params: Record<string, unknown>) {
  const chatId = params.chat_id

  return { id: typeof chatId === 'string' ? 0 : chatId, type: 'private' }
}
