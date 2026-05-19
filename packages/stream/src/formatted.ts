/** structural shape of a markup parser — avoids a runtime dep on `@puregram/markup` */
interface MarkupCallable {
  (source: string): { text: string, entities: readonly { type: string, offset: number, length: number }[] }
  lenient: (source: string) => { text: string, entities: readonly { type: string, offset: number, length: number }[] }
}

interface MarkupModule {
  md?: MarkupCallable
  html?: MarkupCallable
}

let cachedMarkup: MarkupModule | null | undefined

async function loadMarkup () {
  if (cachedMarkup !== undefined) {
    return cachedMarkup
  }

  try {
    cachedMarkup = await import('@puregram/markup') as MarkupModule
  } catch {
    cachedMarkup = null
  }

  return cachedMarkup
}

/** narrow public parseMode union — matches the bot-api `parse_mode` strings we accept for streaming */
export type ParseMode = 'MarkdownV2' | 'HTML'

/** plain payload — what `sendMessageDraft` / `sendMessage` ultimately receive on the wire */
export interface ParsedPayload {
  text: string
  entities?: readonly { type: string, offset: number, length: number }[]
}

/**
 * lenient per-tick parse — for drafts mid-stream. on parser absence or failure, returns the raw text
 * with no entities (acceptable degradation; final `sendMessage` re-parses strictly)
 */
export async function parseLenient (text: string, mode: ParseMode | undefined) {
  if (mode === undefined) {
    return { text }
  }

  const markup = await loadMarkup()
  const parser = mode === 'MarkdownV2' ? markup?.md : markup?.html

  if (!parser) {
    return { text }
  }

  try {
    const parsed = parser.lenient(text)

    return { text: parsed.text, entities: parsed.entities }
  } catch {
    return { text }
  }
}

/**
 * strict parse — for the terminal `sendMessage`. throws on malformed markup so the caller surfaces it via
 * `onError`. when the markup package is unavailable, falls back to sending raw text + `parse_mode`
 */
export async function parseStrict (text: string, mode: ParseMode | undefined) {
  if (mode === undefined) {
    return { text }
  }

  const markup = await loadMarkup()
  const parser = mode === 'MarkdownV2' ? markup?.md : markup?.html

  if (!parser) {
    return { text, fallbackParseMode: mode }
  }

  const parsed = parser(text)

  return { text: parsed.text, entities: parsed.entities }
}
