import { describe, expect, it } from 'vitest'

import {
  footer, pullQuote, taskList, media, photo, video, audio, map, collage, slideshow, table
} from '../src/builders/block'

const md = (n: { render: (d: 'markdown' | 'html') => string }) => n.render('markdown')
const html = (n: { render: (d: 'markdown' | 'html') => string }) => n.render('html')

describe('footer / pullQuote', () => {
  it('renders as html tags in both dialects', () => {
    expect(md(footer('f'))).toBe('<footer>f</footer>')
    expect(html(pullQuote('q'))).toBe('<aside>q</aside>')
    expect(html(pullQuote('q', 'me'))).toBe('<aside>q<cite>me</cite></aside>')
  })
})

describe('taskList', () => {
  it('renders markdown checkboxes and an html fallback list', () => {
    expect(md(taskList([{ text: 'a' }, { text: 'b', done: true }]))).toBe('- [ ] a\n- [x] b')
    expect(html(taskList([{ text: 'a' }, { text: 'b', done: true }]))).toBe('<ul><li>☐ a</li><li>☑ b</li></ul>')
  })
})

describe('media', () => {
  it('renders markdown image syntax with an optional caption title', () => {
    expect(md(media('https://x/p.jpg'))).toBe('![](https://x/p.jpg)')
    expect(md(media('https://x/p.jpg', { caption: 'cap' }))).toBe('![](https://x/p.jpg "cap")')
  })

  it('escapes the markdown url and caption quotes', () => {
    expect(md(media('https://x/p.jpg?a=1)x', { caption: 'a"b' }))).toBe('![](https://x/p.jpg?a=1\\)x "a&#34;b")')
  })

  it('infers the html tag from the url and supports spoiler + figure caption', () => {
    expect(html(photo('https://x/p.jpg'))).toBe('<img src="https://x/p.jpg"/>')
    expect(html(video('https://x/v.mp4'))).toBe('<video src="https://x/v.mp4"></video>')
    expect(html(audio('https://x/a.mp3'))).toBe('<audio src="https://x/a.mp3"></audio>')
    expect(html(media('https://x/v.mp4'))).toBe('<video src="https://x/v.mp4"></video>')
    expect(html(photo('https://x/p.jpg', { spoiler: true, caption: 'cap' })))
      .toBe('<figure><img src="https://x/p.jpg" tg-spoiler/><figcaption>cap</figcaption></figure>')
  })
})

describe('map', () => {
  it('renders a tg-map tag with optional zoom + caption', () => {
    expect(html(map(41.9, 12.5))).toBe('<tg-map lat="41.9" long="12.5"/>')
    expect(html(map(41.9, 12.5, { zoom: 14 }))).toBe('<tg-map lat="41.9" long="12.5" zoom="14"/>')
    expect(html(map(41.9, 12.5, { caption: 'c' })))
      .toBe('<figure><tg-map lat="41.9" long="12.5"/><figcaption>c</figcaption></figure>')
  })
})

describe('collage / slideshow', () => {
  it('html inlines the media items', () => {
    expect(html(collage([photo('https://x/p.jpg'), video('https://x/v.mp4')])))
      .toBe('<tg-collage><img src="https://x/p.jpg"/><video src="https://x/v.mp4"></video></tg-collage>')
    expect(html(slideshow([photo('https://x/p.jpg')], { caption: 's' })))
      .toBe('<tg-slideshow><img src="https://x/p.jpg"/><figcaption>s</figcaption></tg-slideshow>')
  })

  it('markdown blank-line-separates the media items', () => {
    expect(md(collage([photo('https://x/p.jpg'), video('https://x/v.mp4')])))
      .toBe('<tg-collage>\n\n![](https://x/p.jpg)\n![](https://x/v.mp4)\n\n</tg-collage>')
  })
})

describe('table', () => {
  it('renders a gfm table with alignment (first row is the header)', () => {
    expect(md(table([['H1', 'H2'], ['a', 'b']], { align: ['left', 'center'] })))
      .toBe('| H1 | H2 |\n| :-- | :-: |\n| a | b |')
  })

  it('escapes pipes inside cells', () => {
    expect(md(table([['a|b'], ['c']]))).toBe('| a\\|b |\n| :-- |\n| c |')
  })

  it('renders html with th/td, align, caption, bordered/striped', () => {
    expect(html(table([['H1', 'H2'], ['a', 'b']], { align: [undefined as never, 'right'], bordered: true, striped: true, caption: 'cap' })))
      .toBe('<table bordered striped><caption>cap</caption><tr><th>H1</th><th align="right">H2</th></tr><tr><td>a</td><td align="right">b</td></tr></table>')
  })
})
