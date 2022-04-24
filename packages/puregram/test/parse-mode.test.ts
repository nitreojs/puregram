import { HTML, Markdown, MarkdownV2 } from '../src'

describe('Parse mode', () => {
  describe('HTML', () => {
    describe('#HTML.raw()', () => {
      it('should raw-ify text properly', () => {
        const text: string = HTML.raw('some <b>text</b> that <i>should be</i> escaped')

        expect(text).toEqual('some &lt;b&gt;text&lt;/b&gt; that &lt;i&gt;should be&lt;/i&gt; escaped')
      })
    })

    describe('#HTML.bold()', () => {
      it('should parse bold text properly', () => {
        const text: string = HTML.bold('bold text')

        expect(text).toEqual('<b>bold text</b>')
      })

      it('should escape characters', () => {
        const text: string = HTML.bold('bold text with <tag> and "phrase"')

        expect(text).toEqual('<b>bold text with &lt;tag&gt; and &quot;phrase&quot;</b>')
      })
    })

    describe('#HTML.italic()', () => {
      it('should parse italic text properly', () => {
        const text: string = HTML.italic('italic text')

        expect(text).toEqual('<i>italic text</i>')
      })

      it('should escape characters', () => {
        const text: string = HTML.italic('italic text with <tag> and "phrase"')

        expect(text).toEqual('<i>italic text with &lt;tag&gt; and &quot;phrase&quot;</i>')
      })
    })

    describe('#HTML.underline()', () => {
      it('should parse underlined text properly', () => {
        const text: string = HTML.underline('underlined text')

        expect(text).toEqual('<u>underlined text</u>')
      })

      it('should escape characters', () => {
        const text: string = HTML.underline('underlined text with <tag> and "phrase"')

        expect(text).toEqual('<u>underlined text with &lt;tag&gt; and &quot;phrase&quot;</u>')
      })
    })

    describe('#HTML.strikethrough()', () => {
      it('should parse strikethrough text properly', () => {
        const text: string = HTML.strikethrough('strikethrough text')

        expect(text).toEqual('<s>strikethrough text</s>')
      })

      it('should escape characters', () => {
        const text: string = HTML.strikethrough('strikethrough text with <tag> and "phrase"')

        expect(text).toEqual('<s>strikethrough text with &lt;tag&gt; and &quot;phrase&quot;</s>')
      })
    })

    describe('#HTML.spoiler()', () => {
      it('should parse spoilered text properly', () => {
        const text: string = HTML.spoiler('spoilered text')

        expect(text).toEqual('<span class="tg-spoiler">spoilered text</span>')
      })

      it('should escape characters', () => {
        const text: string = HTML.spoiler('spoilered text with <tag> and "phrase"')

        expect(text).toEqual('<span class="tg-spoiler">spoilered text with &lt;tag&gt; and &quot;phrase&quot;</span>')
      })
    })

    describe('#HTML.url()', () => {
      it('should parse url properly', () => {
        const text: string = HTML.url('url text', 'example.com')

        expect(text).toEqual('<a href="example.com">url text</a>')
      })

      it('should escape characters', () => {
        const text: string = HTML.url('url text with <tag> and "phrase"', 'example.com')

        expect(text).toEqual(
          '<a href="example.com">url text with &lt;tag&gt; and &quot;phrase&quot;</a>'
        )
      })
    })

    describe('#HTML.mention()', () => {
      it('should parse mention properly', () => {
        const text: string = HTML.mention('mention text', 1)

        expect(text).toEqual('<a href="tg://user?id=1">mention text</a>')
      })

      it('should escape characters', () => {
        const text: string = HTML.mention('mention text with <tag> and "phrase"', 1)

        expect(text).toEqual(
          '<a href="tg://user?id=1">mention text with &lt;tag&gt; and &quot;phrase&quot;</a>'
        )
      })
    })

    describe('#HTML.code()', () => {
      it('should parse code properly', () => {
        const text: string = HTML.code('code text')
        const textWithLanguage: string = HTML.code('code text', 'javascript')

        expect(text).toEqual('<code>code text</code>')
        expect(textWithLanguage).toEqual('<code class="language-javascript">code text</code>')
      })

      it('should escape characters', () => {
        const text: string = HTML.code('code text with <tag> and "phrase"')
        const textWithLanguage: string = HTML.code('code text with <tag> and "phrase"', 'javascript')

        expect(text).toEqual('<code>code text with &lt;tag&gt; and &quot;phrase&quot;</code>')
        expect(textWithLanguage).toEqual(
          '<code class="language-javascript">code text with &lt;tag&gt; and &quot;phrase&quot;</code>'
        )
      })
    })

    describe('#HTML.pre()', () => {
      it('should parse pre text properly', () => {
        const text: string = HTML.pre('pre text')

        expect(text).toEqual('<pre>pre text</pre>')
      })

      it('should escape characters', () => {
        const text: string = HTML.pre('pre text with <tag> and "phrase"')

        expect(text).toEqual('<pre>pre text with &lt;tag&gt; and &quot;phrase&quot;</pre>')
      })
    })

    describe('#HTML.parseMode', () => {
      it('should return parse mode', () => {
        expect(HTML.parseMode).toEqual('HTML')
      })
    })
  })

  describe('Markdown', () => {
    describe('#Markdown.raw()', () => {
      it('should raw-ify text properly', () => {
        const text: string = Markdown.raw('some *text* that _should be_ escaped')

        expect(text).toEqual('some \\*text\\* that \\_should be\\_ escaped')
      })
    })

    describe('#Markdown.bold()', () => {
      it('should parse bold text properly', () => {
        const text: string = Markdown.bold('bold text')

        expect(text).toEqual('*bold text*')
      })

      it('should not escape characters', () => {
        const text: string = Markdown.bold(
          `bold text ${Markdown.italic('with italic text')}`
        )

        expect(text).toEqual('*bold text _with italic text_*')
      })
    })

    describe('#Markdown.italic()', () => {
      it('should parse italic text properly', () => {
        const text: string = Markdown.italic('italic text')

        expect(text).toEqual('_italic text_')
      })

      it('should not escape characters', () => {
        const text: string = Markdown.italic(
          `italic text ${Markdown.bold('with bold text')}`
        )

        expect(text).toEqual('_italic text *with bold text*_')
      })
    })

    describe('#Markdown.url()', () => {
      it('should parse url properly', () => {
        const text: string = Markdown.url('url text', 'example.com')

        expect(text).toEqual('[url text](example.com)')
      })

      it('should escape characters in url', () => {
        const text: string = Markdown.url('text with [chars]', 'example.com')

        expect(text).toEqual('[text with \\[chars\\]](example.com)')
      })
    })

    describe('#Markdown.mention()', () => {
      it('should parse mention properly', () => {
        const text: string = Markdown.mention('mention text', 1)

        expect(text).toEqual('[mention text](tg://user?id=1)')
      })

      it('should escape characters in mention', () => {
        const text: string = Markdown.mention('text with [chars]', 1)

        expect(text).toEqual('[text with \\[chars\\]](tg://user?id=1)')
      })
    })

    describe('#Markdown.code()', () => {
      it('should parse code properly', () => {
        const text: string = Markdown.code('preformatted text')

        expect(text).toEqual('`preformatted text`')
      })

      it('should escape characters in code', () => {
        const text: string = Markdown.code('preformatted text with `chars`')

        expect(text).toEqual('`preformatted text with \\`chars\\``')
      })
    })

    describe('#Markdown.pre()', () => {
      it('should parse preformatted area properly', () => {
        const text: string = Markdown.pre('preformatted area')

        expect(text).toEqual('```\npreformatted area\n```')
      })

      it('should not escape characters in preformatted area', () => {
        const text: string = Markdown.pre('preformatted area with `chars`')

        expect(text).toEqual('```\npreformatted area with `chars`\n```')
      })
    })

    describe('#Markdown.parseMode', () => {
      it('should return parse mode', () => {
        expect(Markdown.parseMode).toEqual('Markdown')
      })
    })
  })

  describe('MarkdownV2', () => {
    describe('#MarkdownV2.raw()', () => {
      it('should raw-ify text properly', () => {
        const text: string = MarkdownV2.raw('some *text* ~that~ _should be_ `escaped`')

        expect(text).toEqual('some \\*text\\* \\~that\\~ \\_should be\\_ \\`escaped\\`')
      })
    })

    describe('#MarkdownV2.bold()', () => {
      it('should parse bold text properly', () => {
        const text: string = MarkdownV2.bold('bold *text')

        expect(text).toEqual('*bold \\*text*')
      })
    })

    describe('#MarkdownV2.italic()', () => {
      it('should parse italic text properly', () => {
        const text: string = MarkdownV2.italic('italic _text')

        expect(text).toEqual('_italic \\_text_')
      })
    })

    describe('#MarkdownV2.underline()', () => {
      it('should parse underlined text properly', () => {
        const text: string = MarkdownV2.underline('underlined _text')

        expect(text).toEqual('__underlined \\_text__')
      })
    })

    describe('#MarkdownV2.strikethrough()', () => {
      it('should parse strikethrough text properly', () => {
        const text: string = MarkdownV2.strikethrough('strikethrough ~text')

        expect(text).toEqual('~strikethrough \\~text~')
      })
    })

    describe('#MarkdownV2.spoiler()', () => {
      it('should parse spoilered text properly', () => {
        const text: string = MarkdownV2.spoiler('spoilered |text')

        expect(text).toEqual('||spoilered \\|text||')
      })
    })

    describe('#MarkdownV2.[many methods]()', () => {
      it('should parse text properly', () => {
        const text: string = MarkdownV2.bold(
          `bold ${MarkdownV2.italic(
            `italic bold ${MarkdownV2.strikethrough(
              'italic bold strikethrough'
            )
            } ${MarkdownV2.underline(
              'underline italic bold'
            )
            }`
          )
          } bold`
        )

        expect(text).toEqual(
          '*bold _italic bold ~italic bold strikethrough~ \\_\\_underline italic bold\\_\\__ bold*'
        )
      })
    })

    describe('#MarkdownV2.url()', () => {
      it('should parse url properly', () => {
        const text: string = MarkdownV2.url('url text', 'example.com')

        expect(text).toEqual('[url text](example.com)')
      })

      it('should escape characters', () => {
        const text: string = MarkdownV2.url('url [text]', '(example.com)')

        expect(text).toEqual('[url [text\\]]((example.com\\))')
      })
    })

    describe('#MarkdownV2.mention()', () => {
      it('should parse mention properly', () => {
        const text: string = MarkdownV2.mention('mention text', 1)

        expect(text).toEqual('[mention text](tg://user?id=1)')
      })

      it('should escape characters', () => {
        const text: string = MarkdownV2.mention('mention [text]', 1)

        expect(text).toEqual('[mention [text\\]](tg://user?id=1)')
      })
    })

    describe('#MarkdownV2.code()', () => {
      it('should parse code properly', () => {
        const text: string = MarkdownV2.code('inline fixed-width code')

        expect(text).toEqual('`inline fixed-width code`')
      })

      it('should escape characters', () => {
        const text: string = MarkdownV2.code('inline `fixed-width` code')

        expect(text).toEqual('`inline \\`fixed-width\\` code`')
      })
    })

    describe('#MarkdownV2.pre()', () => {
      it('should parse preformatted area properly', () => {
        const text: string = MarkdownV2.pre('pre-formatted fixed-width code block')
        const textWithLanguage: string = MarkdownV2.pre(
          'pre-formatted fixed-width code block',
          'python'
        )

        expect(text).toEqual('```\npre-formatted fixed-width code block\n```')
        expect(textWithLanguage).toEqual('```python\npre-formatted fixed-width code block\n```')
      })

      it('should not escape characters', () => {
        const text: string = MarkdownV2.pre('preformatted area with `chars`')

        expect(text).toEqual('```\npreformatted area with `chars`\n```')
      })
    })

    describe('#MarkdownV2.parseMode', () => {
      it('should return parse mode', () => {
        expect(MarkdownV2.parseMode).toEqual('MarkdownV2')
      })
    })
  })
})
