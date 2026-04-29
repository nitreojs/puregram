// content filters — `text` / `caption` value-or-regex matchers, the canonical
// `command(name | pattern)` parser, generic `regex` against text-or-caption, and
// the `startsWith` / `endsWith` / `contains` shorthands. value/regex variants
// attach a `match: RegExpMatchArray` onto the update so handlers can read named
// captures via `update.match?.groups?.foo`. when several match-attaching filters
// chain through `and(...)` the rightmost one wins (Object.defineProperty is
// configurable in `attach`)

import { defineFilter, hasCaption, hasText } from '@puregram/api'
import type { BoostAddedUpdate, BusinessMessageUpdate, ChannelPostUpdate, ChatSharedUpdate, DeleteChatPhotoUpdate, EditedBusinessMessageUpdate, EditedChannelPostUpdate, EditedMessageUpdate, Filter, ForumTopicClosedUpdate, ForumTopicCreatedUpdate, ForumTopicEditedUpdate, ForumTopicReopenedUpdate, GeneralForumTopicHiddenUpdate, GeneralForumTopicUnhiddenUpdate, GiveawayCompletedUpdate, GiveawayCreatedUpdate, GiveawayWinnersUpdate, GroupChatCreatedUpdate, InvoiceUpdate, LeftChatMemberUpdate, MessageAutoDeleteTimerChangedUpdate, MessageUpdate, MigrateFromChatIdUpdate, MigrateToChatIdUpdate, NewChatMembersUpdate, NewChatPhotoUpdate, NewChatTitleUpdate, PassportDataUpdate, PinnedMessageUpdate, ProximityAlertTriggeredUpdate, SuccessfulPaymentUpdate, UsersSharedUpdate, VideoChatEndedUpdate, VideoChatParticipantsInvitedUpdate, VideoChatScheduledUpdate, VideoChatStartedUpdate, WebAppDataUpdate, WriteAccessAllowedUpdate } from '@puregram/api'

import { attach } from '../dispatch/attach'

type TextBearingUpdate =
  | MessageUpdate
  | EditedMessageUpdate
  | ChannelPostUpdate
  | EditedChannelPostUpdate
  | BusinessMessageUpdate
  | EditedBusinessMessageUpdate
  | NewChatMembersUpdate
  | LeftChatMemberUpdate
  | NewChatTitleUpdate
  | NewChatPhotoUpdate
  | DeleteChatPhotoUpdate
  | GroupChatCreatedUpdate
  | PinnedMessageUpdate
  | InvoiceUpdate
  | SuccessfulPaymentUpdate
  | UsersSharedUpdate
  | ChatSharedUpdate
  | WebAppDataUpdate
  | VideoChatScheduledUpdate
  | VideoChatStartedUpdate
  | VideoChatEndedUpdate
  | VideoChatParticipantsInvitedUpdate
  | ForumTopicCreatedUpdate
  | ForumTopicEditedUpdate
  | ForumTopicClosedUpdate
  | ForumTopicReopenedUpdate
  | GeneralForumTopicHiddenUpdate
  | GeneralForumTopicUnhiddenUpdate
  | GiveawayCreatedUpdate
  | GiveawayCompletedUpdate
  | GiveawayWinnersUpdate
  | BoostAddedUpdate
  | MessageAutoDeleteTimerChangedUpdate
  | MigrateToChatIdUpdate
  | MigrateFromChatIdUpdate
  | PassportDataUpdate
  | ProximityAlertTriggeredUpdate
  | WriteAccessAllowedUpdate

// `caption` shares the same set of bearing kinds as `text` in the bot-api schema
// (every message-shaped update can carry either field). reuse the codegen'd
// `kinds` lists rather than re-typing the hand-curated set, so additions to the
// schema flow through automatically. the codegen always emits `kinds`, so the
// `?? []` fallback is purely a typing concession to the optional property type
const TEXT_KINDS: readonly string[] = hasText.kinds ?? []
const CAPTION_KINDS: readonly string[] = hasCaption.kinds ?? []

// union of text-bearing and caption-bearing kinds — practically the same set,
// dedupe via Set in case the schema diverges in the future
const TEXT_OR_CAPTION_KINDS: readonly string[] =
  [...new Set([...TEXT_KINDS, ...CAPTION_KINDS])]

type TextOrCaptionField = 'text' | 'caption' | 'auto'

interface FieldOptions {
  /** which field to scan — `'auto'` tries text then caption (default) */
  field?: TextOrCaptionField
}

function readText (u: unknown) {
  return (u as { text?: unknown }).text
}

function readCaption (u: unknown) {
  return (u as { caption?: unknown }).caption
}

/**
 * match against `update.text` — string form is exact equality, regex form runs
 * the pattern against the text and attaches the result as `update.match`
 */
export function text (value: string): Filter<TextBearingUpdate>
export function text (pattern: RegExp): Filter<TextBearingUpdate>
export function text (value: string | RegExp): Filter<TextBearingUpdate> {
  if (typeof value === 'string') {
    return defineFilter(
      `text(${value})`,
      (u: unknown): u is TextBearingUpdate => readText(u) === value,
      { kinds: TEXT_KINDS }
    )
  }

  const pattern = value

  return defineFilter(
    `text(${pattern.toString()})`,
    (u: unknown): u is TextBearingUpdate => {
      const t = readText(u)

      if (typeof t !== 'string') {
        return false
      }

      const result = pattern.exec(t)

      if (result === null) {
        return false
      }

      attach(u as object, 'match', result)

      return true
    },
    { kinds: TEXT_KINDS }
  )
}

/**
 * match against `update.caption` — string form is exact equality, regex form
 * runs the pattern against the caption and attaches the result as `update.match`
 */
export function caption (value: string): Filter<TextBearingUpdate>
export function caption (pattern: RegExp): Filter<TextBearingUpdate>
export function caption (value: string | RegExp): Filter<TextBearingUpdate> {
  if (typeof value === 'string') {
    return defineFilter(
      `caption(${value})`,
      (u: unknown): u is TextBearingUpdate => readCaption(u) === value,
      { kinds: CAPTION_KINDS }
    )
  }

  const pattern = value

  return defineFilter(
    `caption(${pattern.toString()})`,
    (u: unknown): u is TextBearingUpdate => {
      const c = readCaption(u)

      if (typeof c !== 'string') {
        return false
      }

      const result = pattern.exec(c)

      if (result === null) {
        return false
      }

      attach(u as object, 'match', result)

      return true
    },
    { kinds: CAPTION_KINDS }
  )
}

// canonical telegram command regex builder — matches `/<name>`, `/<name> args`,
// `/<name>@bot args`, or `/<name>\nstuff`. case-insensitive because telegram
// clients sometimes uppercase commands sent via auto-complete. the optional
// `mention` named group surfaces the `@bot` suffix for the wrapping
// `tg.command(...)` to validate against `this.bot.username` (handled in K.8;
// the filter itself stays mention-agnostic)
function buildCommandPattern (name: string) {
  return new RegExp(`^/${escapeRegExp(name)}(?:@(?<mention>\\S+))?(?:[\\s\\n]|$)`, 'i')
}

function escapeRegExp (s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * match a slash-command on `update.text`. string form parses `/name`,
 * `/name@bot`, `/name args`, or a `/name`-prefixed newline; regex form runs
 * directly against the text. attaches the regex match as `update.match`
 *
 * the `@bot` mention check is intentionally not performed here — that lives
 * in `tg.command(...)` so module-level composition (`f.command('start')`)
 * remains mention-agnostic
 */
export function command (name: string): Filter<MessageUpdate>
export function command (pattern: RegExp): Filter<MessageUpdate>
export function command (nameOrPattern: string | RegExp): Filter<MessageUpdate> {
  const pattern = typeof nameOrPattern === 'string'
    ? buildCommandPattern(nameOrPattern)
    : nameOrPattern
  const label = typeof nameOrPattern === 'string'
    ? nameOrPattern
    : nameOrPattern.toString()

  return defineFilter(
    `command(${label})`,
    (u: unknown): u is MessageUpdate => {
      const text = (u as { raw?: { text?: unknown } }).raw?.text

      if (typeof text !== 'string') {
        return false
      }

      const result = pattern.exec(text)

      if (result === null) {
        return false
      }

      attach(u as object, 'match', result)

      return true
    },
    { kinds: ['message'] }
  )
}

/**
 * match a regex against `update.text` falling back to `update.caption`. attaches
 * the resulting `RegExpMatchArray` as `update.match`
 */
export function regex (pattern: RegExp) {
  return defineFilter(
    `regex(${pattern.toString()})`,
    (u: unknown): u is TextBearingUpdate => {
      const t = readText(u)
      const target = typeof t === 'string' ? t : readCaption(u)

      if (typeof target !== 'string') {
        return false
      }

      const result = pattern.exec(target)

      if (result === null) {
        return false
      }

      attach(u as object, 'match', result)

      return true
    },
    { kinds: TEXT_OR_CAPTION_KINDS }
  )
}

function pickField (u: unknown, field: TextOrCaptionField) {
  if (field === 'text') {
    const t = readText(u)

    return typeof t === 'string' ? t : undefined
  }

  if (field === 'caption') {
    const c = readCaption(u)

    return typeof c === 'string' ? c : undefined
  }

  const t = readText(u)

  if (typeof t === 'string') {
    return t
  }

  const c = readCaption(u)

  return typeof c === 'string' ? c : undefined
}

function fieldKinds (field: TextOrCaptionField) {
  if (field === 'text') {
    return TEXT_KINDS
  }

  if (field === 'caption') {
    return CAPTION_KINDS
  }

  return TEXT_OR_CAPTION_KINDS
}

/**
 * match when `update.text` (or `update.caption`, depending on `field`) starts
 * with the supplied prefix. defaults to `auto` — text first, falling back to
 * caption when text is absent
 */
export function startsWith (prefix: string, opts: FieldOptions = {}) {
  const field = opts.field ?? 'auto'
  const kinds = fieldKinds(field)

  return defineFilter(
    `startsWith(${prefix})`,
    (u: unknown): u is TextBearingUpdate => {
      const value = pickField(u, field)

      return value !== undefined && value.startsWith(prefix)
    },
    { kinds }
  )
}

/**
 * match when `update.text` (or `update.caption`, depending on `field`) ends
 * with the supplied suffix. defaults to `auto` — text first, falling back to
 * caption when text is absent
 */
export function endsWith (suffix: string, opts: FieldOptions = {}) {
  const field = opts.field ?? 'auto'
  const kinds = fieldKinds(field)

  return defineFilter(
    `endsWith(${suffix})`,
    (u: unknown): u is TextBearingUpdate => {
      const value = pickField(u, field)

      return value !== undefined && value.endsWith(suffix)
    },
    { kinds }
  )
}

/**
 * match when `update.text` (or `update.caption`, depending on `field`) contains
 * the supplied substring. defaults to `auto` — text first, falling back to
 * caption when text is absent
 */
export function contains (substring: string, opts: FieldOptions = {}) {
  const field = opts.field ?? 'auto'
  const kinds = fieldKinds(field)

  return defineFilter(
    `contains(${substring})`,
    (u: unknown): u is TextBearingUpdate => {
      const value = pickField(u, field)

      return value !== undefined && value.includes(substring)
    },
    { kinds }
  )
}
