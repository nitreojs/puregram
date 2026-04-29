// media presence filters — semantic re-exports of the codegen'd `hasX`
// presence checks under shorter, content-oriented names. keeps `puregram/filters`
// ergonomic without duplicating the schema-derived `kinds` metadata that lives
// on the codegen'd filters

export {
  hasAnimation as animation,
  hasAudio as audio,
  hasContact as contact,
  hasDice as dice,
  hasDocument as document,
  hasGame as game,
  hasInvoice as invoice,
  hasLocation as location,
  hasPaidMedia as paidMedia,
  hasPhoto as photo,
  hasPoll as poll,
  hasSticker as sticker,
  hasStory as story,
  hasVenue as venue,
  hasVideo as video,
  hasVideoNote as videoNote,
  hasVoice as voice
} from '@puregram/api'
