import {
  BusinessMessageUpdate, ChannelPostUpdate, EditedBusinessMessageUpdate,
  EditedChannelPostUpdate, EditedMessageUpdate, MessageUpdate
} from '@puregram/api'
import type { TelegramMessage } from '@puregram/api'
import { createPlugin, type Telegram } from 'puregram'

import { runStream, type StreamApi, type StreamResult } from './core'
import type { ParseMode } from './formatted'
import { normalize, type StreamSource } from './normalize'

/** options accepted by both `tg.stream` and `update.stream` */
export interface StreamCallOptions {
  parseMode?: ParseMode
  editIntervalMs?: number
  maxEditBackoff?: number
  thinkingPlaceholder?: boolean
  draftIdOffset?: number
  signal?: AbortSignal
  message_thread_id?: number
  reply_parameters?: unknown
  link_preview_options?: unknown
  disable_notification?: boolean
  protect_content?: boolean
  reply_markup?: unknown
  onPiece?: (piece: { text: string }, draftId: number) => void
  onDraftFinalized?: (msg: TelegramMessage) => void
  onError?: (err: unknown) => void | Promise<void>
}

/** params passed to `tg.stream` — same as `StreamCallOptions` plus the chat id and source */
export interface StreamTgParams extends StreamCallOptions {
  chat_id: number
  source: StreamSource
}

/** `tg.stream` extension shape — exposed on the `Telegram` instance after the plugin is installed */
export interface StreamExtension {
  (params: StreamTgParams): Promise<StreamResult>
}

declare module '@puregram/api' {
  interface MessageUpdate {
    stream: (source: StreamSource, options?: StreamCallOptions) => Promise<StreamResult>
  }

  interface EditedMessageUpdate {
    stream: (source: StreamSource, options?: StreamCallOptions) => Promise<StreamResult>
  }

  interface ChannelPostUpdate {
    stream: (source: StreamSource, options?: StreamCallOptions) => Promise<StreamResult>
  }

  interface EditedChannelPostUpdate {
    stream: (source: StreamSource, options?: StreamCallOptions) => Promise<StreamResult>
  }

  interface BusinessMessageUpdate {
    stream: (source: StreamSource, options?: StreamCallOptions) => Promise<StreamResult>
  }

  interface EditedBusinessMessageUpdate {
    stream: (source: StreamSource, options?: StreamCallOptions) => Promise<StreamResult>
  }
}

interface PrivateGuardSource {
  raw: { chat: { id: number, type: string }, message_id: number }
}

function assertPrivate (chatType: string, chatId: number) {
  if (chatType !== 'private') {
    throw new Error(
      `[@puregram/stream] sendMessageDraft is private-chat only (got '${chatType}' for chat ${chatId}). ` +
      'a streamEdit-based fallback for groups is planned'
    )
  }
}

function deriveOffsetFromMessage (raw: { message_id: number }) {
  // 256 unique draft ids per source message — high bits hold message_id, low bits hold the counter
  return (raw.message_id << 8) >>> 0
}

/**
 * `@puregram/stream` plugin. installs `tg.stream({ chat_id, source, ... })` and
 * `update.stream(source, options?)` on every message-shaped update wrapper
 */
export function stream () {
  return createPlugin({
    name: 'stream',
    install: (tg: Telegram) => {
      const api = tg.api as unknown as StreamApi

      let counter = 0
      const nextOffset = () => {
        const offset = counter

        counter = (counter + 1) >>> 0

        return offset
      }

      const runFromTg: StreamExtension = async (params) => {
        // tg.stream is out-of-context; caller passes a private chat id
        const { chat_id: chatId, source, draftIdOffset, ...rest } = params
        const normalized = normalize(source)

        return runStream(api, {
          ...rest,
          chatId,
          source: normalized,
          draftIdOffset: draftIdOffset ?? nextOffset()
        })
      }

      // eslint-disable-next-line @typescript-eslint/naming-convention -- ctor refs are PascalCase classes
      const patchPrototype = (ctor: { prototype: object }) => {
        Object.defineProperty(ctor.prototype, 'stream', {
          value: function (this: PrivateGuardSource, source: StreamSource, options: StreamCallOptions = {}) {
            assertPrivate(this.raw.chat.type, this.raw.chat.id)

            const { draftIdOffset, ...rest } = options
            const normalized = normalize(source)

            return runStream(api, {
              ...rest,
              chatId: this.raw.chat.id,
              source: normalized,
              draftIdOffset: draftIdOffset ?? deriveOffsetFromMessage(this.raw)
            })
          },
          writable: true,
          configurable: true,
          enumerable: false
        })
      }

      const targets = [
        MessageUpdate,
        EditedMessageUpdate,
        ChannelPostUpdate,
        EditedChannelPostUpdate,
        BusinessMessageUpdate,
        EditedBusinessMessageUpdate
      ]

      for (const target of targets) {
        patchPrototype(target)
      }

      return { stream: runFromTg }
    }
  })
}
