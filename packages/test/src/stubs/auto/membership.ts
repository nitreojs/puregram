import type { ChatMembership } from '../../actors/chat'
import type { World } from '../../world/world'

function flipStatus (
  world: World,
  chatId: number | string,
  userId: number,
  newStatus: ChatMembership['status']
) {
  const chat = world.findChat(chatId)

  if (chat === undefined) {
    return
  }

  chat.setMembership(userId, { status: newStatus, since: Math.floor(Date.now() / 1000) })
}

export function banChatMember (world: World, params: Record<string, unknown>) {
  flipStatus(world, params.chat_id as number | string, params.user_id as number, 'kicked')

  return true
}

export function unbanChatMember (world: World, params: Record<string, unknown>) {
  flipStatus(world, params.chat_id as number | string, params.user_id as number, 'left')

  return true
}

export function restrictChatMember (world: World, params: Record<string, unknown>) {
  flipStatus(world, params.chat_id as number | string, params.user_id as number, 'restricted')

  return true
}

export function promoteChatMember (world: World, params: Record<string, unknown>) {
  flipStatus(world, params.chat_id as number | string, params.user_id as number, 'administrator')

  return true
}

export function setChatAdministratorCustomTitle (world: World, params: Record<string, unknown>) {
  const chat = world.findChat(params.chat_id as number | string)
  const userId = params.user_id as number
  const existing = chat?.members.get(userId)

  if (chat !== undefined && existing !== undefined) {
    chat.setMembership(userId, { ...existing, customTitle: params.custom_title as string })
  }

  return true
}

export function setChatPermissions (_world: World, _params: Record<string, unknown>) {
  return true
}

export function getChatMember (world: World, params: Record<string, unknown>) {
  const chat = world.findChat(params.chat_id as number | string)
  const userId = params.user_id as number
  const user = world.users.find(u => u.id === userId)
  const userRaw = user?.toRaw() ?? { id: userId, is_bot: false, first_name: 'Unknown' }

  if (chat === undefined) {
    return { status: 'left', user: userRaw }
  }

  const explicit = chat.members.get(userId)
  const status = explicit?.status ?? (chat.type === 'private' ? 'member' : 'left')

  return { status, user: userRaw }
}

export function getChatMemberCount (world: World, params: Record<string, unknown>) {
  const chat = world.findChat(params.chat_id as number | string)

  if (chat === undefined) {
    return 1
  }

  let count = 0

  for (const [, m] of chat.members) {
    if (m.status === 'creator' || m.status === 'administrator' || m.status === 'member' || m.status === 'restricted') {
      count += 1
    }
  }

  if (chat.type !== 'private') {
    count += 1
  }

  return count
}

export function getChatAdministrators (world: World, params: Record<string, unknown>) {
  const chat = world.findChat(params.chat_id as number | string)

  if (chat === undefined) {
    return []
  }

  const out: { status: string, user: Record<string, unknown> }[] = []

  for (const [userId, m] of chat.members) {
    if (m.status === 'creator' || m.status === 'administrator') {
      const user = world.users.find(u => u.id === userId)
      const userRaw = user?.toRaw() ?? { id: userId, is_bot: false, first_name: 'Unknown' }

      out.push({ status: m.status, user: userRaw })
    }
  }

  if (chat.type !== 'private') {
    out.push({
      status: 'administrator',
      user: { id: world.bot.id, is_bot: true, first_name: world.bot.first_name }
    })
  }

  return out
}
