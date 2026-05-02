import { TestMessage } from '../../actors/message'
import type { World } from '../../world/world'

function buildAndAppend (world: World, chatId: number | string, mutate?: (msg: TestMessage) => void) {
  const numericId = typeof chatId === 'string' ? Number(chatId) : chatId
  const chat = world.findOrCreatePrivate(numericId)
  const msg = new TestMessage({
    chat,
    from: undefined,
    message_id: chat.nextMessageId(),
    date: Math.floor(Date.now() / 1000)
  })

  mutate?.(msg)
  chat.appendMessage(msg)

  return msg
}

function findMessage (world: World, chatId: number | string, messageId: number) {
  const chat = world.findChat(chatId)

  if (chat === undefined) {
    return undefined
  }

  const msg = chat.messages.find(m => m.message_id === messageId)

  return msg !== undefined ? { chat, msg } : undefined
}

export function sendMessage (world: World, params: Record<string, unknown>) {
  const msg = buildAndAppend(world, params.chat_id as number | string, (m) => {
    m.text = (params.text as string) ?? ''
  })

  return msg.toRaw()
}

export function sendPhoto (world: World, params: Record<string, unknown>) {
  const msg = buildAndAppend(world, params.chat_id as number | string, (m) => {
    if (params.caption !== undefined) {
      m.caption = params.caption as string
    }
  })

  const raw = msg.toRaw()

  raw.photo = [{ file_id: 'stub', file_unique_id: 'stub', width: 100, height: 100, file_size: 1 }]

  return raw
}

export function editMessageText (world: World, params: Record<string, unknown>) {
  const found = findMessage(world, params.chat_id as number | string, params.message_id as number)

  if (found === undefined) {
    throw new Error('editMessageText: message not found')
  }

  found.msg.text = params.text as string

  return found.msg.toRaw()
}

export function editMessageCaption (world: World, params: Record<string, unknown>) {
  const found = findMessage(world, params.chat_id as number | string, params.message_id as number)

  if (found === undefined) {
    throw new Error('editMessageCaption: message not found')
  }

  if (params.caption !== undefined) {
    found.msg.caption = params.caption as string
  } else {
    found.msg.caption = undefined
  }

  return found.msg.toRaw()
}

export function editMessageReplyMarkup (world: World, params: Record<string, unknown>) {
  const found = findMessage(world, params.chat_id as number | string, params.message_id as number)

  if (found === undefined) {
    throw new Error('editMessageReplyMarkup: message not found')
  }

  found.msg.replyMarkup = params.reply_markup

  return found.msg.toRaw()
}

export function editMessageMedia (world: World, params: Record<string, unknown>) {
  const found = findMessage(world, params.chat_id as number | string, params.message_id as number)

  return found?.msg.toRaw() ?? true
}

export function editMessageLiveLocation (world: World, params: Record<string, unknown>) {
  const found = findMessage(world, params.chat_id as number | string, params.message_id as number)

  return found?.msg.toRaw() ?? true
}

export function stopMessageLiveLocation (world: World, params: Record<string, unknown>) {
  const found = findMessage(world, params.chat_id as number | string, params.message_id as number)

  return found?.msg.toRaw() ?? true
}

export function deleteMessage (world: World, params: Record<string, unknown>) {
  const chat = world.findChat(params.chat_id as number | string)

  if (chat === undefined) {
    return true
  }

  const idx = chat.messages.findIndex(m => m.message_id === params.message_id)

  if (idx >= 0) {
    const msg = chat.messages[idx]

    if (msg !== undefined) {
      msg.isDeleted = true
    }

    chat.removeAt(idx)
  }

  return true
}

export function deleteMessages (world: World, params: Record<string, unknown>) {
  const chat = world.findChat(params.chat_id as number | string)

  if (chat === undefined) {
    return true
  }

  const ids = (params.message_ids as number[]) ?? []

  for (const id of ids) {
    const idx = chat.messages.findIndex(m => m.message_id === id)

    if (idx >= 0) {
      const msg = chat.messages[idx]

      if (msg !== undefined) {
        msg.isDeleted = true
      }

      chat.removeAt(idx)
    }
  }

  return true
}

export function forwardMessage (world: World, params: Record<string, unknown>) {
  const fromChatId = params.from_chat_id as number | string
  const messageId = params.message_id as number
  const fromChat = world.findChat(fromChatId)
  const original = fromChat?.messages.find(m => m.message_id === messageId)

  if (original === undefined) {
    throw new Error('forwardMessage: source not found')
  }

  const targetId = typeof params.chat_id === 'string' ? Number(params.chat_id) : params.chat_id as number
  const target = world.findOrCreatePrivate(targetId)
  const copy = new TestMessage({
    chat: target,
    from: undefined,
    message_id: target.nextMessageId(),
    date: Math.floor(Date.now() / 1000)
  })

  copy.text = original.text

  if (original.caption !== undefined) {
    copy.caption = original.caption
  }

  target.appendMessage(copy)

  const raw = copy.toRaw()

  raw.forward_origin = {
    type: 'user',
    sender_user: original.from?.toRaw() ?? null,
    date: original.date
  }

  return raw
}

export function forwardMessages (world: World, params: Record<string, unknown>) {
  const ids = (params.message_ids as number[]) ?? []
  const out: { message_id: number }[] = []

  for (const id of ids) {
    const single = forwardMessage(world, { ...params, message_id: id })

    out.push({ message_id: single.message_id as number })
  }

  return out
}

export function copyMessage (world: World, params: Record<string, unknown>) {
  const fromChatId = params.from_chat_id as number | string
  const messageId = params.message_id as number
  const fromChat = world.findChat(fromChatId)
  const original = fromChat?.messages.find(m => m.message_id === messageId)

  if (original === undefined) {
    throw new Error('copyMessage: source not found')
  }

  const targetId = typeof params.chat_id === 'string' ? Number(params.chat_id) : params.chat_id as number
  const target = world.findOrCreatePrivate(targetId)
  const copy = new TestMessage({
    chat: target,
    from: undefined,
    message_id: target.nextMessageId(),
    date: Math.floor(Date.now() / 1000)
  })

  copy.text = original.text

  if (original.caption !== undefined) {
    copy.caption = original.caption
  }

  target.appendMessage(copy)

  return { message_id: copy.message_id }
}

export function copyMessages (world: World, params: Record<string, unknown>) {
  const ids = (params.message_ids as number[]) ?? []
  const out: { message_id: number }[] = []

  for (const id of ids) {
    const single = copyMessage(world, { ...params, message_id: id }) as { message_id: number }

    out.push(single)
  }

  return out
}
