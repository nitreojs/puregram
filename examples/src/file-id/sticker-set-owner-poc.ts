// =====================================================================
// proof-of-concept — decode a sticker set's owner user_id from bot api
// =====================================================================
//
// telegram numeric sticker set ids encode the creator's user_id in their
// upper bits. mtproto-level clients (pyrogram, mtcute, telethon) can read
// the numeric set id directly via `messages.getStickerSet`. the bot api
// does NOT expose that field — but the set's thumbnail file_id, when
// parsed via @puregram/file-id, carries `stickerSetId` for free
//
// pipeline:
//   sticker arrives  →  sticker.set_name
//   bot api getStickerSet(name)  →  thumbnail.file_id (when the set has a thumb)
//   FileId.from(thumb.fileId)  →  source.stickerSetId  (bigint)
//   decodeStickerSetOwner(stickerSetId)  →  { userId, setIncrement? }
//
// caveats — read before relying on this in production:
//
//   1. the decoder branches below are reverse-engineered from community
//      research and are not part of any published TL schema; telegram
//      can change their id allocation and silently break this code
//
//   2. sets without a thumbnail produce no id — many small/private packs
//      ship without one, so the function simply isn't applicable then
//
//   3. anonymous / telegram-owned sets resolve to service-account
//      user_ids that aren't meaningful (treat large/sentinel results
//      with suspicion)
//
//   4. legacy / version variants of the thumbnail photo size source all
//      carry the same `stickerSetId` field — handle every variant
//
// if this turns out to be useful for real bots, we can promote
// `decodeStickerSetOwner` into @puregram/file-id alongside the existing
// decoders; for now it lives here as a PoC

import { FileId } from '@puregram/file-id'
import { Telegram } from 'puregram'

interface DecodedStickerSetOwner {
  /** decoded creator user_id — may be a service account for telegram-owned sets */
  userId: bigint
  /** position of this set in the owner's set list, when present in the encoding */
  setIncrement: number | undefined
}

/** decode the owner user_id from a sticker set's 64-bit numeric id */
function decodeStickerSetOwner (setId: bigint): DecodedStickerSetOwner {
  const lowMask = 0xFFFFFFFFn
  const low32 = setId & lowMask

  // sentinel branch — sets created by users whose id sits in this range
  // get a fixed low-32-bit marker and an additive offset on the high half
  if (low32 === 0xFF3FFFFFn) {
    return {
      userId: (setId >> 32n) + 0x180000000n,
      setIncrement: undefined
    }
  }

  let userId = setId >> 32n

  // high byte of the low 32 bits non-zero → user id outgrew 32 bits, add 2^32 back
  if ((setId >> 24n) & 0xFFn) {
    userId += 0x100000000n

    return { userId, setIncrement: undefined }
  }

  // otherwise the low 32 is the per-owner increment id
  return {
    userId,
    setIncrement: Number(low32)
  }
}

/** extract a sticker set's `stickerSetId` from its thumbnail file_id */
function extractStickerSetId (thumbnailFileId: string): bigint | undefined {
  const parsed = FileId.from(thumbnailFileId)
  const photoSize = parsed.photoSize

  if (photoSize === undefined) {
    return undefined
  }

  if (
    photoSize.type === 'sticker_set_thumbnail'
    || photoSize.type === 'sticker_set_thumbnail_legacy'
    || photoSize.type === 'sticker_set_thumbnail_version'
  ) {
    return photoSize.stickerSetId
  }

  return undefined
}

// =====================================================================
// demo bot — send a sticker, get the (best-effort) owner user_id back
// =====================================================================

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage(async (message) => {
  if (!message.hasSticker()) {
    return
  }

  const setName = message.sticker.setName

  if (setName === undefined) {
    await message.send('this sticker doesn\'t belong to a set i can look up')

    return
  }

  const set = await telegram.api.getStickerSet({ name: setName })
  const thumbnail = set.thumbnail

  if (thumbnail === undefined) {
    await message.send(`set "${set.title}" has no thumbnail — can't extract the numeric id from bot api`)

    return
  }

  const setId = extractStickerSetId(thumbnail.file_id)

  if (setId === undefined) {
    await message.send('thumbnail file_id did not carry a sticker_set source — nothing to decode')

    return
  }

  const decoded = decodeStickerSetOwner(setId)

  await message.send([
    `set:        ${set.title} (${setName})`,
    `set id:     ${setId}`,
    `owner id:   ${decoded.userId}  ← reverse-engineered, treat as best-effort`,
    decoded.setIncrement !== undefined ? `increment:  ${decoded.setIncrement}` : ''
  ].filter(Boolean).join('\n'))
})

await telegram.startPolling()
