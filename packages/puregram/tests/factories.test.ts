import { describe, it, expect } from 'vitest'

import {
  ChatAdministratorRights,
  ChatPermissions,
  InlineQueryResult,
  InputMedia,
  InputMessageContent,
  LinkPreview,
  MediaSource,
  Reaction,
  ReplyParameters
} from '../src'

describe('InputMedia', () => {
  it('inherits generated photo factory', () => {
    const r = InputMedia.photo({ media: 'attach://x' })

    expect(r).toEqual({ type: 'photo', media: 'attach://x' })
  })

  it('adds sticker synthetic variant', () => {
    const m = MediaSource.fileId('cat')
    const r = InputMedia.sticker({ media: m })

    expect(r.type).toBe('sticker')
    expect(r.media).toBe(m)
  })

  it('adds videoNote and voice synthetic variants', () => {
    expect(InputMedia.videoNote({ media: 'attach://vn' }).type).toBe('video_note')
    expect(InputMedia.voice({ media: 'attach://v' }).type).toBe('voice')
  })
})

describe('InlineQueryResult', () => {
  it('inherits generated article factory', () => {
    const r = InlineQueryResult.article({
      id: '1',
      title: 't',
      input_message_content: InputMessageContent.text('hi')
    })

    expect(r.type).toBe('article')
    expect(r.input_message_content).toEqual({ message_text: 'hi' })
  })

  it('exposes cached factories under .cached', () => {
    const r = InlineQueryResult.cached.audio({ id: '1', audio_file_id: 'fid' })

    expect(r).toEqual({ type: 'audio', id: '1', audio_file_id: 'fid' })
  })

  it('builds a results button', () => {
    const r = InlineQueryResult.button('open', { start_parameter: 'go' })

    expect(r).toEqual({ text: 'open', start_parameter: 'go' })
  })
})

describe('InputMessageContent', () => {
  it('text wraps message_text', () => {
    expect(InputMessageContent.text('hi', { parse_mode: 'HTML' }))
      .toEqual({ message_text: 'hi', parse_mode: 'HTML' })
  })

  it('location wraps lat/lng', () => {
    expect(InputMessageContent.location(55, 37, { horizontal_accuracy: 5 }))
      .toEqual({ latitude: 55, longitude: 37, horizontal_accuracy: 5 })
  })
})

describe('ReplyParameters', () => {
  it('to references a same-chat message', () => {
    expect(ReplyParameters.to(42)).toEqual({ message_id: 42 })
  })

  it('cross targets a different chat', () => {
    expect(ReplyParameters.cross(-100, 42, { allow_sending_without_reply: true }))
      .toEqual({ message_id: 42, chat_id: -100, allow_sending_without_reply: true })
  })

  it('quote attaches a quote excerpt', () => {
    expect(ReplyParameters.quote(7, 'why?')).toEqual({ message_id: 7, quote: 'why?' })
  })
})

describe('LinkPreview', () => {
  it('disabled produces is_disabled', () => {
    expect(LinkPreview.disabled()).toEqual({ is_disabled: true })
  })

  it('large prefers large media', () => {
    expect(LinkPreview.large('https://x'))
      .toEqual({ url: 'https://x', prefer_large_media: true })
  })

  it('small prefers small media', () => {
    expect(LinkPreview.small('https://x', { show_above_text: true }))
      .toEqual({ url: 'https://x', prefer_small_media: true, show_above_text: true })
  })
})

describe('Reaction', () => {
  it('emoji wraps an emoji', () => {
    expect(Reaction.emoji('👍')).toEqual({ type: 'emoji', emoji: '👍' })
  })

  it('customEmoji wraps an id', () => {
    expect(Reaction.customEmoji('abc')).toEqual({ type: 'custom_emoji', custom_emoji_id: 'abc' })
  })

  it('paid emits paid type', () => {
    expect(Reaction.paid()).toEqual({ type: 'paid' })
  })
})

describe('ChatPermissions', () => {
  it('allowAll fills every permission with true', () => {
    const r = ChatPermissions.allowAll()

    expect(r.can_send_messages).toBe(true)
    expect(r.can_pin_messages).toBe(true)
    expect(r.can_manage_topics).toBe(true)
  })

  it('denyAll fills every permission with false', () => {
    const r = ChatPermissions.denyAll()

    expect(r.can_send_messages).toBe(false)
    expect(r.can_pin_messages).toBe(false)
  })

  it('overrides are applied last', () => {
    const r = ChatPermissions.denyAll({ can_send_messages: true })

    expect(r.can_send_messages).toBe(true)
    expect(r.can_pin_messages).toBe(false)
  })
})

describe('ChatAdministratorRights', () => {
  it('allowAll includes optional channel/group fields', () => {
    const r = ChatAdministratorRights.allowAll()

    expect(r.can_manage_chat).toBe(true)
    expect(r.is_anonymous).toBe(true)
    expect(r.can_pin_messages).toBe(true)
  })

  it('denyAll omits optional fields', () => {
    const r = ChatAdministratorRights.denyAll()

    expect(r.can_manage_chat).toBe(false)
    expect(r.is_anonymous).toBe(false)
    expect(r.can_pin_messages).toBeUndefined()
  })
})
