import { describe, expect, it } from 'vitest'

import { ChatMember, Contact, File as TgFile, Location, User } from '../src/generated/structures'

describe('User.displayName', () => {
  it('returns just first name when last name is missing', () => {
    const u = new User({ id: 1, is_bot: false, first_name: 'Anna' })

    expect(u.displayName).toBe('Anna')
  })

  it('combines first and last name when both present', () => {
    const u = new User({ id: 1, is_bot: false, first_name: 'Anna', last_name: 'Karenina' })

    expect(u.displayName).toBe('Anna Karenina')
  })

  it('treats empty-string last name as missing', () => {
    const u = new User({ id: 1, is_bot: false, first_name: 'Anna', last_name: '' })

    expect(u.displayName).toBe('Anna')
  })
})

describe('User.mention', () => {
  it('defaults to html parse mode', () => {
    const u = new User({ id: 42, is_bot: false, first_name: 'Anna' })

    expect(u.mention()).toBe('<a href="tg://user?id=42">Anna</a>')
  })

  it('html escapes &, <, > in display name', () => {
    const u = new User({ id: 42, is_bot: false, first_name: 'Bob & <Jane>' })

    expect(u.mention('html')).toBe('<a href="tg://user?id=42">Bob &amp; &lt;Jane&gt;</a>')
  })

  it('html uses last name when present', () => {
    const u = new User({ id: 7, is_bot: false, first_name: 'Anna', last_name: 'K' })

    expect(u.mention('html')).toBe('<a href="tg://user?id=7">Anna K</a>')
  })

  it('markdownv2 escapes the full reserved set', () => {
    const u = new User({ id: 9, is_bot: false, first_name: 'a_b*c[d]e(f)g~h`i>j#k+l-m=n|o{p}q.r!s\\t' })

    expect(u.mention('markdownv2')).toBe(
      '[a\\_b\\*c\\[d\\]e\\(f\\)g\\~h\\`i\\>j\\#k\\+l\\-m\\=n\\|o\\{p\\}q\\.r\\!s\\\\t](tg://user?id=9)'
    )
  })

  it('markdownv2 leaves unreserved characters alone', () => {
    const u = new User({ id: 9, is_bot: false, first_name: 'Anna' })

    expect(u.mention('markdownv2')).toBe('[Anna](tg://user?id=9)')
  })

  it('legacy markdown only escapes [, ], and \\', () => {
    const u = new User({ id: 9, is_bot: false, first_name: 'a[b]c\\d.e' })

    expect(u.mention('markdown')).toBe('[a\\[b\\]c\\\\d.e](tg://user?id=9)')
  })
})

describe('Contact.displayName', () => {
  it('returns just first name when last name is missing', () => {
    const c = new Contact({ phone_number: '+1', first_name: 'Anna' })

    expect(c.displayName).toBe('Anna')
  })

  it('combines first and last name when both present', () => {
    const c = new Contact({ phone_number: '+1', first_name: 'Anna', last_name: 'K' })

    expect(c.displayName).toBe('Anna K')
  })
})

describe('File.link', () => {
  it('builds a download url when file_path is present', () => {
    const f = new TgFile({ file_id: 'abc', file_unique_id: 'u', file_path: 'photos/file_1.jpg' })

    expect(f.link('TOKEN')).toBe('https://api.telegram.org/file/bot' + 'TOKEN/photos/file_1.jpg')
  })

  it('returns undefined when file_path is missing', () => {
    const f = new TgFile({ file_id: 'abc', file_unique_id: 'u' })

    expect(f.link('TOKEN')).toBeUndefined()
  })
})

describe('ChatMember.isAdmin / isCreator / isMember', () => {
  it('isAdmin true only for status === administrator', () => {
    expect(new ChatMember({ status: 'administrator' } as any).isAdmin()).toBe(true)
    expect(new ChatMember({ status: 'creator' } as any).isAdmin()).toBe(false)
    expect(new ChatMember({ status: 'member' } as any).isAdmin()).toBe(false)
    expect(new ChatMember({ status: 'left' } as any).isAdmin()).toBe(false)
  })

  it('isCreator true only for status === creator', () => {
    expect(new ChatMember({ status: 'creator' } as any).isCreator()).toBe(true)
    expect(new ChatMember({ status: 'administrator' } as any).isCreator()).toBe(false)
    expect(new ChatMember({ status: 'member' } as any).isCreator()).toBe(false)
  })

  it('isMember true only for status === member (strict, not "currently in chat")', () => {
    expect(new ChatMember({ status: 'member' } as any).isMember()).toBe(true)
    expect(new ChatMember({ status: 'creator' } as any).isMember()).toBe(false)
    expect(new ChatMember({ status: 'administrator' } as any).isMember()).toBe(false)
    expect(new ChatMember({ status: 'restricted' } as any).isMember()).toBe(false)
  })

  it('returns false when status is missing entirely', () => {
    const cm = new ChatMember({} as any)

    expect(cm.isAdmin()).toBe(false)
    expect(cm.isCreator()).toBe(false)
    expect(cm.isMember()).toBe(false)
  })
})

describe('Location.coordinates', () => {
  it('returns [latitude, longitude] tuple', () => {
    const loc = new Location({ latitude: 55.75, longitude: 37.61 })

    expect(loc.coordinates).toEqual([55.75, 37.61])
  })

  it('preserves coordinate order even with negative values', () => {
    const loc = new Location({ latitude: -33.86, longitude: 151.21 })

    expect(loc.coordinates).toEqual([-33.86, 151.21])
  })
})
