import type { World } from '../world/world'

import { answerTrue } from './auto/answers'
import { fallback } from './auto/fallback'
import { getChat, getMe } from './auto/identity'
import {
  copyMessage,
  copyMessages,
  deleteMessage,
  deleteMessages,
  editMessageCaption,
  editMessageLiveLocation,
  editMessageMedia,
  editMessageReplyMarkup,
  editMessageText,
  forwardMessage,
  forwardMessages,
  sendMessage,
  sendPhoto,
  stopMessageLiveLocation
} from './auto/messages'

type AutoStubFn = (world: World, params: Record<string, unknown>) => unknown

const TABLE: Record<string, AutoStubFn> = {
  getMe,
  getChat,

  sendMessage,
  sendPhoto,
  forwardMessage,
  forwardMessages,
  copyMessage,
  copyMessages,

  editMessageText,
  editMessageCaption,
  editMessageReplyMarkup,
  editMessageMedia,
  editMessageLiveLocation,
  stopMessageLiveLocation,

  deleteMessage,
  deleteMessages,

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
