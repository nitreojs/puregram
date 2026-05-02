import type { World } from '../world/world'

import { answerTrue } from './auto/answers'
import { fallback } from './auto/fallback'
import { getChat, getMe } from './auto/identity'
import { sendMessage, sendPhoto } from './auto/messages'

type AutoStubFn = (world: World, params: Record<string, unknown>) => unknown

const TABLE: Record<string, AutoStubFn> = {
  getMe,
  getChat,

  sendMessage,
  sendPhoto,

  answerCallbackQuery: answerTrue,
  answerInlineQuery: answerTrue,
  answerWebAppQuery: answerTrue,
  answerShippingQuery: answerTrue,
  answerPreCheckoutQuery: answerTrue
}

export function runAutoStub (world: World, method: string, params: Record<string, unknown>) {
  const fn = TABLE[method] ?? fallback

  return fn(world, params)
}

export { TABLE as AUTO_STUB_TABLE }
