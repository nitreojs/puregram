import { Formatted, bold, format, italic, link } from '@puregram/markup'

// build a Formatted then serialize it for off-channel sinks (logs, webhooks, telemetry)
// `.toHtml()` produces telegram html source; `.toMarkdown()` produces markdown v2 source
const greeting = format`hello, ${bold('world')} — ${italic('from')} ${link('puregram', 'https://github.com/nitreojs/puregram')}`

console.log('html    :', Formatted.from(greeting).toHtml())
console.log('markdown:', Formatted.from(greeting).toMarkdown())
console.log('plain   :', greeting.toString())
