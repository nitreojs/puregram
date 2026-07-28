import type { TelegramMessage } from '@puregram/api'

import {
  DEFAULT_EDIT_INTERVAL_MS, DEFAULT_MAX_EDIT_BACKOFF,
  DRAFT_ID_MAX, DRAFT_SAFETY_MS, DRAFT_TTL_MS, MAX_CHUNK, MAX_RICH_CHUNK
} from './constants'
import { parseLenient, parseStrict, type ParseMode } from './formatted'

/** the per-call options forwarded to bot-api methods. mirrors `SendMessageParams` minus what the plugin owns */
export interface StreamForwardOptions {
  message_thread_id?: number
  reply_parameters?: unknown
  link_preview_options?: unknown
  disable_notification?: boolean
  protect_content?: boolean
  reply_markup?: unknown
}

/** entity shape used by all hooks — matches the on-the-wire `TelegramMessageEntity` but without the strict literal */
export interface StreamEntity {
  type: string
  offset: number
  length: number
}

/** hook callback shapes — `onPiece` is per-source-yield, `onDraftFinalized` is per terminal `sendMessage` */
export interface StreamCallbacks {
  onPiece?: (piece: { text: string, entities?: readonly StreamEntity[] }, draftId: number) => void
  onDraftFinalized?: (msg: TelegramMessage) => void
  onError?: (err: unknown) => void | Promise<void>
}

/** rich-message dialect — exactly one of these is written into `rich_message` */
export type RichDialect = 'markdown' | 'html'

/** full options for `runStream`; aggregates the call-site shape into a single struct */
export interface RunStreamOptions extends StreamForwardOptions, StreamCallbacks {
  chatId: number
  source: AsyncIterable<string>
  parseMode?: ParseMode
  rich?: boolean | RichDialect
  editIntervalMs?: number
  maxEditBackoff?: number
  thinkingPlaceholder?: boolean
  draftIdOffset: number
  signal?: AbortSignal
}

/** result accounting returned by `tg.stream` and `update.stream` */
export interface StreamResult {
  messages: TelegramMessage[]
  drafts: number
  pieces: number
  bytes: number
  skipped: number
  aborted: boolean
}

/** minimal tg-api surface this core leans on — keeps the state machine testable without a `Telegram` instance */
export interface StreamApi {
  sendMessage: (params: Record<string, unknown>) => Promise<TelegramMessage>
  sendMessageDraft: (params: Record<string, unknown>) => Promise<unknown>
}

const sleep = (ms: number) =>
  ms <= 0 ? Promise.resolve() : new Promise<void>(resolve => setTimeout(resolve, ms))

function normalizeDraftId (offset: number, counter: number) {
  // draft_id must be a non-zero positive 32-bit int. reduced arithmetically — a bitwise
  // coercion truncates offsets past 2^32 and lands two distant streams on one id
  const raw = Math.abs(Math.trunc(offset) + counter) % DRAFT_ID_MAX

  return raw === 0 ? 1 : raw
}

// bounded so a whitespace-free chunk can't turn every rollover into a full-buffer scan
const ROLLOVER_LOOKBEHIND = 256

// telegram renders a halved surrogate pair as U+FFFD. `limit` must be positive
function findCut (text: string, limit: number) {
  const floor = Math.max(1, limit - ROLLOVER_LOOKBEHIND)

  const newline = text.lastIndexOf('\n', limit - 1)

  if (newline >= floor - 1) {
    return newline + 1
  }

  const space = text.lastIndexOf(' ', limit - 1)

  if (space >= floor - 1) {
    return space + 1
  }

  const tail = text.charCodeAt(limit - 1)
  const next = text.charCodeAt(limit)

  if (tail >= 0xD800 && tail <= 0xDBFF && next >= 0xDC00 && next <= 0xDFFF) {
    return limit - 1
  }

  return limit
}

interface SendPayload {
  text: string
  entities?: readonly { type: string, offset: number, length: number }[]
  fallbackParseMode?: ParseMode
}

/** per-run strategy: which rollover cap to use and how to turn a payload into wire content fields */
interface StreamMode {
  rich: boolean
  maxChunk: number
  body: (payload: SendPayload) => Record<string, unknown>
}

function resolveMode (rich: boolean | RichDialect | undefined) {
  if (rich === undefined || rich === false) {
    return {
      rich: false,
      maxChunk: MAX_CHUNK,
      body: (payload: SendPayload) => {
        const fields: Record<string, unknown> = { text: payload.text }

        if (payload.entities && payload.entities.length > 0) {
          fields.entities = payload.entities
        } else if (payload.fallbackParseMode !== undefined) {
          fields.parse_mode = payload.fallbackParseMode
        }

        return fields
      }
    }
  }

  const dialect: RichDialect = rich === true ? 'markdown' : rich

  return {
    rich: true,
    maxChunk: MAX_RICH_CHUNK,
    body: (payload: SendPayload) => ({ rich_message: { [dialect]: payload.text } })
  }
}

function buildSendParams (
  chatId: number,
  payload: SendPayload,
  opts: StreamForwardOptions,
  mode: StreamMode,
  isTerminal: boolean
) {
  const params: Record<string, unknown> = {
    chat_id: chatId,
    ...mode.body(payload)
  }

  if (opts.message_thread_id !== undefined) {
    params.message_thread_id = opts.message_thread_id
  }

  if (opts.reply_parameters !== undefined) {
    params.reply_parameters = opts.reply_parameters
  }

  // rich messages own their link handling — sendRichMessage has no link_preview_options
  if (!mode.rich && opts.link_preview_options !== undefined) {
    params.link_preview_options = opts.link_preview_options
  }

  if (opts.disable_notification !== undefined) {
    params.disable_notification = opts.disable_notification
  }

  if (opts.protect_content !== undefined) {
    params.protect_content = opts.protect_content
  }

  if (isTerminal && opts.reply_markup !== undefined) {
    params.reply_markup = opts.reply_markup
  }

  return params
}

interface DraftSlot {
  id: number
  text: string
  finalized: boolean
}

/**
 * pull/push state machine. drains `opts.source` into per-draft text windows, ships intermediate
 * `sendMessageDraft` previews under a soft edit interval, and finalizes each window via `sendMessage`
 */
export async function runStream (api: StreamApi, opts: RunStreamOptions) {
  if (opts.rich && opts.parseMode !== undefined) {
    throw new Error('[@puregram/stream] `rich` and `parseMode` are mutually exclusive — rich messages carry their own dialect')
  }

  const mode = resolveMode(opts.rich)
  const editInterval = opts.editIntervalMs ?? DEFAULT_EDIT_INTERVAL_MS
  const maxBackoff = opts.maxEditBackoff ?? DEFAULT_MAX_EDIT_BACKOFF
  const wantThinking = opts.thinkingPlaceholder ?? true

  const result: StreamResult = { messages: [], drafts: 0, pieces: 0, bytes: 0, skipped: 0, aborted: false }
  const slots: DraftSlot[] = [{ id: normalizeDraftId(opts.draftIdOffset, 0), text: '', finalized: false }]
  const completed: DraftSlot[] = []

  let pulling = true
  let pullErr: unknown
  let dirty = false
  let lastDraftTs = 0
  let driftSleep = 0
  let wakeResolve: (() => void) | undefined

  const wake = () => {
    wakeResolve?.()
    wakeResolve = undefined
  }

  const waitForWork = () => new Promise<void>((resolve) => {
    if (!pulling || completed.length > 0 || dirty || opts.signal?.aborted) {
      resolve()

      return
    }

    wakeResolve = resolve
  })

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- noUncheckedIndexedAccess
  const currentSlot = () => slots[slots.length - 1] as DraftSlot

  const pumpSource = async () => {
    try {
      for await (const chunk of opts.source) {
        if (opts.signal?.aborted) {
          break
        }

        if (chunk.length === 0) {
          continue
        }

        result.pieces += 1
        result.bytes += chunk.length

        let remaining = chunk

        while (remaining.length > 0) {
          const slot = currentSlot()
          const room = mode.maxChunk - slot.text.length

          if (remaining.length <= room) {
            slot.text += remaining; remaining = ''
          } else {
            const cut = room > 0 ? findCut(remaining, room) : 0

            slot.text += remaining.slice(0, cut)
            slot.finalized = true
            completed.push(slot)
            slots.push({ id: normalizeDraftId(opts.draftIdOffset, slots.length), text: '', finalized: false })
            remaining = remaining.slice(cut)
          }
        }

        opts.onPiece?.({ text: chunk }, currentSlot().id)
        dirty = true
        wake()
      }
    } catch (err) {
      pullErr = err
    } finally {
      pulling = false
      wake()
    }
  }

  const pumpPromise = pumpSource()

  if (wantThinking) {
    try {
      await api.sendMessageDraft({
        chat_id: opts.chatId,
        draft_id: currentSlot().id,
        ...mode.body({ text: '' }),
        ...(opts.message_thread_id !== undefined ? { message_thread_id: opts.message_thread_id } : {})
      })

      result.drafts += 1
      lastDraftTs = Date.now()
    } catch (err) {
      // failed thinking placeholder shouldn't kill the stream — next draft tick retries
      await opts.onError?.(err)
    }
  }

  while (true) {
    if (opts.signal?.aborted) {
      result.aborted = true; break
    }

    // ttl-protected forced finalize — gated on first draft going out so a delayed source
    // paired with `thinkingPlaceholder: false` doesn't trip on the first tick
    const now = Date.now()
    const sinceDraft = lastDraftTs === 0 ? 0 : now - lastDraftTs
    const ttlThreshold = DRAFT_TTL_MS - DRAFT_SAFETY_MS

    if (lastDraftTs !== 0 && sinceDraft >= ttlThreshold && !currentSlot().finalized && currentSlot().text.length > 0) {
      // promote current to completed so it goes out before the preview expires
      currentSlot().finalized = true
      completed.push(currentSlot())
      slots.push({ id: normalizeDraftId(opts.draftIdOffset, slots.length), text: '', finalized: false })
      dirty = false
    }

    while (completed.length > 0) {
      // guarded by the loop condition
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const slot = completed.shift()!

      const payload = await parseStrict(slot.text, opts.parseMode).catch(async (err) => {
        await opts.onError?.(err)

        return { text: slot.text }
      })

      const sent = await api.sendMessage(buildSendParams(opts.chatId, payload, opts, mode, true))

      result.messages.push(sent)
      opts.onDraftFinalized?.(sent)
    }

    if (!pulling && !dirty && completed.length === 0) {
      break
    }

    if (dirty) {
      const delta = editInterval - (Date.now() - lastDraftTs)

      if (delta > 0) {
        driftSleep = Math.min(driftSleep + delta, maxBackoff)

        if (driftSleep >= maxBackoff && lastDraftTs !== 0) {
          // stalled — drop this tick, the next yield overwrites it
          result.skipped += 1
          dirty = false
          driftSleep = 0

          continue
        }

        await sleep(delta); continue
      }

      driftSleep = 0
      dirty = false

      const slot = currentSlot()
      const text = slot.text

      if (text.length === 0) {
        continue
      }

      const payload = await parseLenient(text, opts.parseMode)
      const draftParams: Record<string, unknown> = {
        chat_id: opts.chatId,
        draft_id: slot.id,
        ...mode.body(payload)
      }

      if (opts.message_thread_id !== undefined) {
        draftParams.message_thread_id = opts.message_thread_id
      }

      try {
        await api.sendMessageDraft(draftParams)
        result.drafts += 1
        lastDraftTs = Date.now()
      } catch (err) {
        result.skipped += 1
        await opts.onError?.(err)
      }

      continue
    }

    await waitForWork()
  }

  const tail = currentSlot()

  if (tail.text.length > 0) {
    const payload = await parseStrict(tail.text, opts.parseMode).catch(async (err) => {
      await opts.onError?.(err)

      return { text: tail.text }
    })

    try {
      const sent = await api.sendMessage(buildSendParams(opts.chatId, payload, opts, mode, true))

      result.messages.push(sent)
      opts.onDraftFinalized?.(sent)
    } catch (err) {
      await opts.onError?.(err)
      throw err
    }
  }

  await pumpPromise

  if (pullErr !== undefined && !result.aborted) {
    await opts.onError?.(pullErr); throw pullErr
  }

  return result
}
