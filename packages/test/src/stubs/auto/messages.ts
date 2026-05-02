import type { World } from '../../world/world'

let messageCounter = 0

function nextMessageId () {
  messageCounter += 1

  return messageCounter
}

export function sendMessage (_world: World, params: Record<string, unknown>) {
  return {
    message_id: nextMessageId(),
    date: Math.floor(Date.now() / 1000),
    chat: { id: params.chat_id, type: 'private' },
    text: params.text
  }
}

export function sendPhoto (_world: World, params: Record<string, unknown>) {
  return {
    message_id: nextMessageId(),
    date: Math.floor(Date.now() / 1000),
    chat: { id: params.chat_id, type: 'private' },
    photo: [{ file_id: 'stub', file_unique_id: 'stub', width: 100, height: 100, file_size: 1 }],
    ...(params.caption !== undefined ? { caption: params.caption } : {})
  }
}
