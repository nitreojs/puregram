import { TestMessage } from '../../actors/message'
import type { FileHandle } from '../../world/files'
import type { World } from '../../world/world'
import { apiError } from '../api-error'

function checkBlocked (world: World, params: Record<string, unknown>) {
  const chatId = params.chat_id

  if (typeof chatId === 'number' && world.blockedUsers.has(chatId)) {
    return apiError(403, 'Forbidden: bot was blocked by the user')
  }

  return undefined
}

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

function resolveMediaParam (world: World, value: unknown) {
  if (typeof value === 'string') {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return world.files.registerUrl(value)
    }

    return world.files.registerFileId(value)
  }

  if (typeof value === 'object' && value !== null) {
    const media = value as { type?: string, value?: unknown }

    if (media.type === 'buffer' && (Buffer.isBuffer(media.value) || media.value instanceof Uint8Array)) {
      return world.files.registerBuffer(media.value)
    }

    if (media.type === 'url' && typeof media.value === 'string') {
      return world.files.registerUrl(media.value)
    }

    if (media.type === 'file_id' && typeof media.value === 'string') {
      return world.files.registerFileId(media.value)
    }

    if (typeof media.type === 'string') {
      const filename = (media as { filename?: string }).filename ?? ''

      return world.files.registerFileId('source-' + media.type + '-' + filename)
    }
  }

  return world.files.registerFileId('unknown-' + String(value))
}

function attachMedia (raw: Record<string, unknown>, field: string, handle: FileHandle) {
  if (field === 'photo') {
    raw.photo = [{
      file_id: handle.file_id,
      file_unique_id: handle.file_unique_id,
      width: 100,
      height: 100
    }]

    return
  }

  raw[field] = { file_id: handle.file_id, file_unique_id: handle.file_unique_id }
}

function makeMediaVerb (field: string) {
  return (world: World, params: Record<string, unknown>) => {
    const handle = resolveMediaParam(world, params[field])
    const msg = buildAndAppend(world, params.chat_id as number | string, (m) => {
      if (params.caption !== undefined) {
        m.caption = params.caption as string
      }
    })
    const raw = msg.toRaw()

    attachMedia(raw, field, handle)

    return raw
  }
}

export function sendMessage (world: World, params: Record<string, unknown>) {
  const blocked = checkBlocked(world, params)

  if (blocked !== undefined) {
    return blocked
  }

  const msg = buildAndAppend(world, params.chat_id as number | string, (m) => {
    m.text = (params.text as string) ?? ''

    if (params.reply_markup !== undefined) {
      m.replyMarkup = params.reply_markup
    }
  })

  return msg.toRaw()
}

export const sendPhoto = makeMediaVerb('photo')
export const sendDocument = makeMediaVerb('document')
export const sendVideo = makeMediaVerb('video')
export const sendAudio = makeMediaVerb('audio')
export const sendVoice = makeMediaVerb('voice')
export const sendAnimation = makeMediaVerb('animation')
export const sendVideoNote = makeMediaVerb('video_note')
export const sendSticker = makeMediaVerb('sticker')

export function sendLocation (world: World, params: Record<string, unknown>) {
  const msg = buildAndAppend(world, params.chat_id as number | string)
  const raw = msg.toRaw()

  raw.location = {
    latitude: params.latitude as number,
    longitude: params.longitude as number
  }

  return raw
}

export function sendVenue (world: World, params: Record<string, unknown>) {
  const msg = buildAndAppend(world, params.chat_id as number | string)
  const raw = msg.toRaw()
  const lat = params.latitude as number
  const lon = params.longitude as number

  raw.location = { latitude: lat, longitude: lon }
  raw.venue = {
    location: { latitude: lat, longitude: lon },
    title: params.title as string,
    address: params.address as string
  }

  return raw
}

export function sendContact (world: World, params: Record<string, unknown>) {
  const msg = buildAndAppend(world, params.chat_id as number | string)
  const raw = msg.toRaw()
  const payload: Record<string, unknown> = {
    phone_number: params.phone_number as string,
    first_name: params.first_name as string
  }

  if (params.last_name !== undefined) {
    payload.last_name = params.last_name as string
  }

  raw.contact = payload

  return raw
}

export function sendPoll (world: World, params: Record<string, unknown>) {
  const msg = buildAndAppend(world, params.chat_id as number | string)
  const raw = msg.toRaw()
  const options = ((params.options as unknown[]) ?? []).map((opt) => {
    const text = typeof opt === 'string' ? opt : (opt as { text: string }).text

    return { text, voter_count: 0 }
  })

  raw.poll = {
    id: 'poll_' + world.nextUpdateId(),
    question: (params.question as string) ?? '',
    options,
    total_voter_count: 0,
    is_closed: false,
    is_anonymous: params.is_anonymous !== false,
    type: (params.type as string) ?? 'regular',
    allows_multiple_answers: params.allows_multiple_answers === true
  }

  return raw
}

export function sendDice (world: World, params: Record<string, unknown>) {
  const msg = buildAndAppend(world, params.chat_id as number | string)
  const raw = msg.toRaw()

  raw.dice = {
    emoji: (params.emoji as string) ?? '🎲',
    value: 1
  }

  return raw
}

export function sendMediaGroup (world: World, params: Record<string, unknown>) {
  const media = (params.media as { type: string, media: unknown, caption?: string }[]) ?? []
  const out: Record<string, unknown>[] = []

  for (const item of media) {
    const handle = resolveMediaParam(world, item.media)
    const msg = buildAndAppend(world, params.chat_id as number | string, (m) => {
      if (item.caption !== undefined) {
        m.caption = item.caption
      }
    })
    const raw = msg.toRaw()

    attachMedia(raw, item.type, handle)
    out.push(raw)
  }

  return out
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
