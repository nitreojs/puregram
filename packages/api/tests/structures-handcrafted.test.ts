import { describe, expect, it } from 'vitest'

import type { TelegramReactionType } from '../src/index'
import {
  Photo,
  PhotoSize,
  PollOption,
  PollOptions,
  ReactionCount,
  ReactionCounts,
  Reactions,
  VideoQualities,
  VideoQuality
} from '../src/index'

const PHOTO_SIZES = [
  { file_id: 's', file_unique_id: 'su', width: 90, height: 90, file_size: 1000 },
  { file_id: 'm', file_unique_id: 'mu', width: 320, height: 320, file_size: 10000 },
  { file_id: 'x', file_unique_id: 'xu', width: 800, height: 800, file_size: 100000 }
]

const VIDEO_QUALITIES = [
  { file_id: 'h', file_unique_id: 'hu', width: 480, height: 360, codec: 'h264', file_size: 5000 },
  { file_id: 'a', file_unique_id: 'au', width: 1080, height: 720, codec: 'av01', file_size: 50000 }
]

const REACTIONS = [
  { type: 'emoji', emoji: '👍' },
  { type: 'custom_emoji', custom_emoji_id: '5368324170671202286' },
  { type: 'paid' }
] as const

const REACTION_COUNTS = [
  { type: { type: 'emoji', emoji: '👍' }, total_count: 7 },
  { type: { type: 'emoji', emoji: '🔥' }, total_count: 12 },
  { type: { type: 'custom_emoji', custom_emoji_id: '5368324170671202286' }, total_count: 3 }
] as const

const POLL_OPTIONS = [
  { persistent_id: 'a', text: 'yes', voter_count: 4 },
  { persistent_id: 'b', text: 'no', voter_count: 9 },
  { persistent_id: 'c', text: 'maybe', voter_count: 2 }
]

describe('Photo', () => {
  it('biggest picks the largest by file_size', () => {
    const photo = new Photo(PHOTO_SIZES)

    expect(photo.biggest).toBeInstanceOf(PhotoSize)
    expect(photo.biggest.fileId).toBe('x')
  })

  it('smallest picks the smallest by file_size', () => {
    const photo = new Photo(PHOTO_SIZES)

    expect(photo.smallest.fileId).toBe('s')
  })

  it('byMin returns the smallest size with width ≥ minWidth', () => {
    const photo = new Photo(PHOTO_SIZES)

    expect(photo.byMin(200).fileId).toBe('m')
    expect(photo.byMin(500).fileId).toBe('x')
  })

  it('byMin falls back to biggest when no size qualifies', () => {
    const photo = new Photo(PHOTO_SIZES)

    expect(photo.byMin(99999).fileId).toBe('x')
  })

  it('length matches the raw array length', () => {
    expect(new Photo(PHOTO_SIZES).length).toBe(3)
  })

  it('iterating yields wrapped PhotoSize in payload order', () => {
    const photo = new Photo(PHOTO_SIZES)
    const widths = [...photo].map(s => s.width)

    expect(widths).toEqual([90, 320, 800])
  })

  it('memoizes wrapped sizes between accesses', () => {
    const photo = new Photo(PHOTO_SIZES)

    expect(photo.sizes).toBe(photo.sizes)
  })

  it('falls back to width × height when file_size is missing', () => {
    const photo = new Photo([
      { file_id: 's', file_unique_id: 'su', width: 90, height: 90 },
      { file_id: 'l', file_unique_id: 'lu', width: 800, height: 800 }
    ])

    expect(photo.biggest.fileId).toBe('l')
    expect(photo.smallest.fileId).toBe('s')
  })

  it('fromPayload returns a new Photo wrapping the array', () => {
    const photo = Photo.fromPayload(PHOTO_SIZES)

    expect(photo).toBeInstanceOf(Photo)
    expect(photo.raw).toBe(PHOTO_SIZES)
  })
})

describe('VideoQualities', () => {
  it('biggest picks the highest-resolution quality', () => {
    const qualities = new VideoQualities(VIDEO_QUALITIES)

    expect(qualities.biggest).toBeInstanceOf(VideoQuality)
    expect(qualities.biggest.codec).toBe('av01')
  })

  it('smallest picks the lowest-resolution quality', () => {
    expect(new VideoQualities(VIDEO_QUALITIES).smallest.codec).toBe('h264')
  })

  it('byCodec finds a quality by codec name', () => {
    const qualities = new VideoQualities(VIDEO_QUALITIES)

    expect(qualities.byCodec('h264')?.width).toBe(480)
    expect(qualities.byCodec('vp9')).toBeUndefined()
  })

  it('byMin returns the smallest qualifying quality, biggest as fallback', () => {
    const qualities = new VideoQualities(VIDEO_QUALITIES)

    expect(qualities.byMin(720).codec).toBe('av01')
    expect(qualities.byMin(99999).codec).toBe('av01')
  })

  it('iterates wrapped VideoQuality in payload order', () => {
    const qualities = new VideoQualities(VIDEO_QUALITIES)
    const codecs = [...qualities].map(q => q.codec)

    expect(codecs).toEqual(['h264', 'av01'])
  })
})

describe('Reactions', () => {
  it('emojis collects only standard emoji reactions', () => {
    expect(new Reactions([...REACTIONS]).emojis).toEqual(['👍'])
  })

  it('customEmojiIds collects only custom emoji ids', () => {
    expect(new Reactions([...REACTIONS]).customEmojiIds).toEqual(['5368324170671202286'])
  })

  it('has matches an emoji without matching custom emoji ids', () => {
    const reactions = new Reactions([...REACTIONS])

    expect(reactions.has('👍')).toBe(true)
    expect(reactions.has('🔥')).toBe(false)
    expect(reactions.has('5368324170671202286')).toBe(false)
  })

  it('hasCustomEmoji and hasPaid discriminate the remaining variants', () => {
    const reactions = new Reactions([...REACTIONS])

    expect(reactions.hasCustomEmoji('5368324170671202286')).toBe(true)
    expect(reactions.hasCustomEmoji('👍')).toBe(false)
    expect(reactions.hasPaid()).toBe(true)
    expect(new Reactions([{ type: 'emoji', emoji: '👍' }]).hasPaid()).toBe(false)
  })

  it('includes compares each variant by its own identity', () => {
    const reactions = new Reactions([...REACTIONS])

    expect(reactions.includes({ type: 'emoji', emoji: '👍' })).toBe(true)
    expect(reactions.includes({ type: 'emoji', emoji: '🔥' })).toBe(false)
    expect(reactions.includes({ type: 'custom_emoji', custom_emoji_id: '5368324170671202286' })).toBe(true)
    expect(reactions.includes({ type: 'custom_emoji', custom_emoji_id: '1' })).toBe(false)
    expect(reactions.includes({ type: 'paid' })).toBe(true)
  })

  it('includes matches an unrecognised variant by type instead of falling through to paid', () => {
    const future = { type: 'stars_v2', star_count: 3 } as unknown as TelegramReactionType

    expect(new Reactions([...REACTIONS]).includes(future)).toBe(false)
    expect(new Reactions([{ type: 'stars_v2' } as unknown as TelegramReactionType]).includes(future)).toBe(true)
  })

  it('memoizes emojis between accesses', () => {
    const reactions = new Reactions([...REACTIONS])

    expect(reactions.emojis).toBe(reactions.emojis)
  })

  it('length and iteration expose the raw payload order', () => {
    const reactions = new Reactions([...REACTIONS])

    expect(reactions.length).toBe(3)
    expect([...reactions].map(r => r.type)).toEqual(['emoji', 'custom_emoji', 'paid'])
  })

  it('is empty-safe', () => {
    const reactions = new Reactions([])

    expect(reactions.length).toBe(0)
    expect(reactions.emojis).toEqual([])
    expect(reactions.has('👍')).toBe(false)
    expect(reactions.hasPaid()).toBe(false)
  })

  it('fromPayload wraps the array without copying it', () => {
    const raw = [...REACTIONS]

    expect(Reactions.fromPayload(raw).raw).toBe(raw)
  })
})

describe('ReactionCounts', () => {
  it('total sums every reaction count', () => {
    expect(new ReactionCounts([...REACTION_COUNTS]).total).toBe(22)
  })

  it('top picks the most-used reaction', () => {
    const counts = new ReactionCounts([...REACTION_COUNTS])

    expect(counts.top).toBeInstanceOf(ReactionCount)
    expect(counts.top?.totalCount).toBe(12)
  })

  it('countOf reads an emoji count and returns 0 when absent', () => {
    const counts = new ReactionCounts([...REACTION_COUNTS])

    expect(counts.countOf('👍')).toBe(7)
    expect(counts.countOf('😀')).toBe(0)
  })

  it('countOfCustomEmoji does not match against emoji reactions', () => {
    const counts = new ReactionCounts([...REACTION_COUNTS])

    expect(counts.countOfCustomEmoji('5368324170671202286')).toBe(3)
    expect(counts.countOfCustomEmoji('👍')).toBe(0)
  })

  it('countOfPaid reads the paid-reaction tally', () => {
    const counts = new ReactionCounts([
      ...REACTION_COUNTS,
      { type: { type: 'paid' }, total_count: 40 }
    ])

    expect(counts.countOfPaid()).toBe(40)
    expect(counts.total).toBe(62)
    expect(new ReactionCounts([...REACTION_COUNTS]).countOfPaid()).toBe(0)
  })

  it('top keeps the first reaction on a tie', () => {
    const counts = new ReactionCounts([
      { type: { type: 'emoji', emoji: '👍' }, total_count: 5 },
      { type: { type: 'emoji', emoji: '🔥' }, total_count: 5 }
    ])

    expect(counts.top?.raw.type).toEqual({ type: 'emoji', emoji: '👍' })
  })

  it('length and fromPayload wrap the array without copying it', () => {
    const raw = [...REACTION_COUNTS]

    expect(new ReactionCounts(raw).length).toBe(3)
    expect(ReactionCounts.fromPayload(raw).raw).toBe(raw)
  })

  it('is empty-safe — total 0 and no top', () => {
    const counts = new ReactionCounts([])

    expect(counts.total).toBe(0)
    expect(counts.top).toBeUndefined()
    expect(counts.countOf('👍')).toBe(0)
  })

  it('memoizes wrapped counts and iterates in payload order', () => {
    const counts = new ReactionCounts([...REACTION_COUNTS])

    expect(counts.counts).toBe(counts.counts)
    expect([...counts].map(c => c.totalCount)).toEqual([7, 12, 3])
  })
})

describe('PollOptions', () => {
  it('winner picks the option with the most votes', () => {
    const options = new PollOptions(POLL_OPTIONS)

    expect(options.winner).toBeInstanceOf(PollOption)
    expect(options.winner.text).toBe('no')
  })

  it('winner keeps the first option on a tie', () => {
    const options = new PollOptions([
      { persistent_id: 'a', text: 'yes', voter_count: 5 },
      { persistent_id: 'b', text: 'no', voter_count: 5 }
    ])

    expect(options.winner.persistentId).toBe('a')
  })

  it('totalVotes sums every option', () => {
    expect(new PollOptions(POLL_OPTIONS).totalVotes).toBe(15)
  })

  it('byId finds an option by persistent id', () => {
    const options = new PollOptions(POLL_OPTIONS)

    expect(options.byId('c')?.text).toBe('maybe')
    expect(options.byId('zzz')).toBeUndefined()
  })

  it('winner throws on an empty payload — sendPoll guarantees 1-12 options', () => {
    expect(() => new PollOptions([]).winner).toThrow(TypeError)
  })

  it('length and fromPayload wrap the array without copying it', () => {
    expect(new PollOptions(POLL_OPTIONS).length).toBe(3)
    expect(PollOptions.fromPayload(POLL_OPTIONS).raw).toBe(POLL_OPTIONS)
  })

  it('memoizes wrapped options and iterates in payload order', () => {
    const options = new PollOptions(POLL_OPTIONS)

    expect(options.options).toBe(options.options)
    expect([...options].map(o => o.text)).toEqual(['yes', 'no', 'maybe'])
  })
})
