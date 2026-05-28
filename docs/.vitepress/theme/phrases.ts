// home hero taglines — mirrored from the puregram.cool landing pool by hand
// (cross-repo import isn't possible; keep in sync if the landing pool changes)
export const TAGLINES = [
  'when you need a cool telegram bot api wrapper 😎👍',
  'telegram bot api, but it actually has types',
  'your bot deserves better than raw fetch 🙏',
  'node 22, typescript, and a little bit of swag',
  '(O_o) she pures on my gram (o_O)',
  'autocomplete for the whole bot api, finally',
  'every update is a class, every method is typed',
  'fetch-based, esm-only, zero legacy baggage',
  'ʕ•ᴥ•ʔ thin wrapper, big types',
  'wraps the bot api so you can stop reading the docs'
]

// 404 punchlines — dispatch-flavored, playful
export const PUNCHLINES = [
  '(O_o) this page pures on no gram',
  'this one slipped past every filter',
  'no route matched that path ✈',
  'ʕ•ᴥ•ʔ unknown update kind',
  'the page flew off somewhere',
  '404: skill issue (ours, not yours)',
  'this update fell through the dispatch chain'
]

export const pick = <T>(pool: readonly T[]): T => pool[Math.floor(Math.random() * pool.length)]
