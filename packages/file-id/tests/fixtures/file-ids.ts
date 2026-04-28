export const FIXTURES = {
  STICKER_V2: 'CAADBAADwwADmFmqDf6xBrPTReqHAg',
  STICKER_V4_22: 'CAADBAADwwADmFmqDf6xBrPTReqHFgQ',
  STICKER_V4_27: 'CAACAgIAAxkBAAIEol9yQhBqFnT4HXldAh31a-hYXuDIAAIECwACAoujAAFFn1sl9AABHbkbBA',
  PHOTO_V2: 'AgADAgADRaoxG64rCUlfm3fj3nihW3PHUQ8ABA0Pma0G3xt2bLABAAEC',
  PHOTO_V4_22: 'AgADAgADRaoxG64rCUlfm3fj3nihW3PHUQ8ABAEAAwIAA3gAA2uwAQABFgQ',
  PHOTO_V4_30: 'AgACAgIAAxkBAAIE2F-nHvTX7tX2Hg946DOPJWEahhgUAAI1sDEbClw4SX8n9AqBZEu9FpVJli4AAwEAAwIAA3gAA-YMBAABHgQ',
  STICKER_OLD: 'CAADAQADegAD997LEUiQZafDlhIeAg',
  STICKER_NEW: 'CAACAgEAAx0CVgtngQACAuFfU1GY9wiRG7A7jlIBbP2yvAostAACegAD997LEUiQZafDlhIeGwQ'
} as const

// per-fixture wrappers used by class.test.ts; keep alongside FIXTURES
export const STICKER_V2 = { fileId: FIXTURES.STICKER_V2 } as const
export const STICKER_V4_22 = { fileId: FIXTURES.STICKER_V4_22 } as const
export const STICKER_V4_27 = { fileId: FIXTURES.STICKER_V4_27 } as const
export const PHOTO_V2 = { fileId: FIXTURES.PHOTO_V2 } as const
export const PHOTO_V4_22 = { fileId: FIXTURES.PHOTO_V4_22 } as const
export const PHOTO_V4_30 = { fileId: FIXTURES.PHOTO_V4_30 } as const
export const STICKER_OLD = { fileId: FIXTURES.STICKER_OLD } as const
export const STICKER_NEW = { fileId: FIXTURES.STICKER_NEW } as const
