/**
 * an opaque media envelope — structurally matches puregram's `MediaSource.*` return values.
 * rich passes it through untouched; the client resolves it (upload / file_id / url) at send time
 */
export interface RichMediaInput {
  type: string
  value: unknown
}

/** anything a media builder accepts as its source — an http(s) url string or a `MediaSource.*` envelope */
export type RichMediaSource = string | RichMediaInput

/** the kind of media a builder emits — mirrors the `InputMedia*` discriminators */
export type RichMediaKind = 'photo' | 'video' | 'audio' | 'animation' | 'voice_note'

/** media kind by url extension — a block must pick its type before telegram sees the file */
export function inferMediaKind (url: string) {
  const ext = (/\.([a-z0-9]+)(?:[?#]|$)/i.exec(url)?.[1] ?? '').toLowerCase()

  if (['mp4', 'mov', 'webm', 'gif'].includes(ext)) {
    return 'video'
  }

  if (['mp3', 'ogg', 'oga', 'm4a', 'wav'].includes(ext)) {
    return 'audio'
  }

  return 'photo'
}
