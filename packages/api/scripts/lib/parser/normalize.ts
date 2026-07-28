import * as cheerio from 'cheerio'
import type { AnyNode } from 'domhandler'

import type { SchemaField, SchemaMethod, SchemaObject, SchemaTypeRef } from '../schema-types'

// union members that aren't section links — RichText also admits a bare string and a nested array,
// neither of which the <ul> of subtype links can express
const UNION_EXTRA_MEMBERS: Record<string, SchemaTypeRef[]> = {
  RichText: [{ kind: 'string' }, { kind: 'array', of: { kind: 'reference', name: 'RichText' } }]
}

// fields whose docs row lacks the "Optional." prefix but is conditional in practice
const OPTIONAL_FIELD_OVERRIDES: Record<string, string[]> = {
  Message: ['ephemeral_message_id']
}

const PRIMITIVE_MAP: Record<string, SchemaTypeRef> = {
  Integer: { kind: 'integer' },
  Int: { kind: 'integer' },
  String: { kind: 'string' },
  Boolean: { kind: 'bool' },
  Bool: { kind: 'bool' },
  Float: { kind: 'float' },
  'Float number': { kind: 'float' },
  True: { kind: 'true' }
}

export function parseTypeRef (text: string): SchemaTypeRef {
  const trimmed = text.trim()

  // array first — commas inside the inner type stay scoped to one splitUnion call
  if (trimmed.startsWith('Array of ')) {
    const inner = trimmed.slice('Array of '.length)

    return { kind: 'array', of: parseTypeRef(inner) }
  }

  // union: "X or Y", "X, Y or Z", or "X, Y, Z and W"
  if (/\s+or\s+|,|\s+and\s+/.test(trimmed)) {
    const parts = splitUnion(trimmed)

    if (parts.length > 1) {
      return { kind: 'union', of: parts.map(parseTypeRef) }
    }
  }

  const primitive = PRIMITIVE_MAP[trimmed]

  if (primitive) {
    return primitive
  }

  if (/^[A-Z]/.test(trimmed)) {
    return { kind: 'reference', name: trimmed }
  }

  throw new Error(`unrecognized type: "${text}"`)
}

function splitUnion (text: string) {
  // bot-api uses comma + or/and at top level — no nested unions inside an "Array of X"
  return text.split(/\s*,\s*|\s+or\s+|\s+and\s+/g).map(s => s.trim()).filter(Boolean)
}

export interface ExtractedSchema {
  methods: SchemaMethod[]
  objects: SchemaObject[]
  // methods whose return type neither a prose pattern nor a description anchor could resolve.
  // they default to `True`, which compiles either way — surfacing the names is the only way a
  // bot-api rephrasing that defeats every pattern gets noticed
  returnTypeFallbacks: string[]
}

export function extractFromHtml (html: string) {
  const $ = cheerio.load(html)

  const methods: SchemaMethod[] = []
  const objects: SchemaObject[] = []
  const returnTypeFallbacks: string[] = []

  $('h4').each((_, h4) => {
    const $h4 = $(h4)
    const name = $h4.text().trim()

    if (!name) {
      return
    }

    const description = collectDescription($, $h4)
    const descriptionLinks = collectDescriptionLinks($, $h4)
    const sectionLinks = collectSectionLinks($, $h4)
    const $table = findSectionTable($, $h4)

    if (isMethodName(name)) {
      const { method, returnTypeGuessed } = extractMethod($, name, description, descriptionLinks, $table)

      methods.push(method)

      if (returnTypeGuessed) {
        returnTypeFallbacks.push(name)
      }
    } else if (isObjectName(name)) {
      objects.push(extractObject($, name, description, sectionLinks, $table))
    }
    // names with spaces are section headers (e.g. "Available types"), ignore
  })

  return { methods, objects, returnTypeFallbacks }
}

function isMethodName (name: string) {
  return /^[a-z][a-zA-Z0-9]*$/.test(name)
}

function isObjectName (name: string) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name)
}

// `AnyNode` is a discriminated union — only `Element` carries `tagName`. text/comment nodes return undefined
function tagOf (node: AnyNode | undefined) {
  if (node && 'tagName' in node) {
    return node.tagName.toUpperCase()
  }

  return undefined
}

function findSectionTable ($: cheerio.CheerioAPI, $h4: cheerio.Cheerio<AnyNode>) {
  let $cursor = $h4.next()

  while ($cursor.length) {
    const tag = tagOf($cursor[0])

    if (tag === 'H4' || tag === 'H3') {
      break
    }

    if (tag === 'TABLE') {
      return $cursor
    }

    $cursor = $cursor.next()
  }

  return $('<table></table>').remove()
}

function collectDescription (_$: cheerio.CheerioAPI, $h4: cheerio.Cheerio<AnyNode>) {
  const parts: string[] = []
  let $cursor = $h4.next()

  while ($cursor.length) {
    const tag = tagOf($cursor[0])

    if (tag === 'H4' || tag === 'H3' || tag === 'TABLE') {
      break
    }

    if (tag === 'P') {
      parts.push($cursor.text().trim())
    }

    $cursor = $cursor.next()
  }

  return parts.join('\n').trim()
}

// subtype links from an adjacent <ul>/<ol> — the structural signal that marks a no-field
// object as a union (BackgroundFill, ChatMember, …). prose <p> links are deliberately
// excluded so stray references ("Use @BotFather", "see Message") never look like variants
function collectSectionLinks ($: cheerio.CheerioAPI, $h4: cheerio.Cheerio<AnyNode>) {
  const links: string[] = []
  let $cursor = $h4.next()

  while ($cursor.length) {
    const tag = tagOf($cursor[0])

    if (tag === 'H4' || tag === 'H3') {
      break
    }

    if (tag === 'UL' || tag === 'OL') {
      $cursor.find('a').each((_, a) => {
        const text = $(a).text().trim()

        if (/^[A-Z][A-Za-z0-9]*$/.test(text) && !links.includes(text)) {
          links.push(text)
        }
      })
    }

    $cursor = $cursor.next()
  }

  return links
}

function collectDescriptionLinks ($: cheerio.CheerioAPI, $h4: cheerio.Cheerio<AnyNode>) {
  const links: string[] = []
  let $cursor = $h4.next()

  while ($cursor.length) {
    const tag = tagOf($cursor[0])

    if (tag === 'H4' || tag === 'H3' || tag === 'TABLE') {
      break
    }

    if (tag === 'P') {
      $cursor.find('a').each((_, a) => {
        const text = $(a).text().trim()

        if (/^[A-Z][A-Za-z0-9]*$/.test(text)) {
          links.push(text)
        }
      })
    }

    $cursor = $cursor.next()
  }

  return links
}

// a docs table can list the same field twice — keep the first occurrence's position, the latest row's content
function dedupeFields (fields: SchemaField[], owner: string) {
  const byName = new Map<string, SchemaField>()

  for (const field of fields) {
    if (byName.has(field.name)) {
      console.warn(`[parse] duplicate field "${field.name}" in ${owner} — keeping the latest row`)
    }

    byName.set(field.name, field)
  }

  return [...byName.values()]
}

function extractMethod (
  $: cheerio.CheerioAPI,
  name: string,
  description: string,
  descriptionLinks: string[],
  $table: cheerio.Cheerio<AnyNode>
) {
  const argumentRows = $table.find('tbody > tr').toArray()

  // method tables: Parameter | Type | Required | Description
  const args: SchemaField[] = argumentRows.map((row) => {
    const cols = $(row).find('td').toArray()
    const fieldName = $(cols[0]).text().trim()
    const typeText = $(cols[1]).text().trim()
    const requiredText = $(cols[2]).text().trim()
    const desc = $(cols[3]).text().trim()
    let type = parseTypeRef(typeText)

    if (type.kind === 'string' && !type.enumeration) {
      const literals = extractEnumeration(desc, fieldName)

      if (literals.length > 0) {
        type = { kind: 'string', enumeration: literals }
      }
    }

    return {
      name: fieldName,
      description: desc,
      required: /yes/i.test(requiredText),
      type
    }
  })

  const returnType = parseReturnTypeFromDescription(description, descriptionLinks)

  const method: SchemaMethod = {
    name,
    description,
    documentationLink: `https://core.telegram.org/bots/api#${name.toLowerCase()}`,
    multipartOnly: /multipart/i.test(description),
    arguments: dedupeFields(args, name),
    returnType: returnType ?? { kind: 'true' }
  }

  return { method, returnTypeGuessed: returnType === undefined }
}

function extractObject (
  $: cheerio.CheerioAPI,
  name: string,
  description: string,
  sectionLinks: string[],
  $table: cheerio.Cheerio<AnyNode>
) {
  const fieldRows = $table.find('tbody > tr').toArray()

  // unions have no field table; their variants are listed in an adjacent <ul>/<ol> of
  // subtype links (collected into sectionLinks). genuinely empty objects (CallbackGame,
  // ForumTopicClosed, …) have neither a table nor such a list, so the presence of member
  // links alone tells unions apart — no per-name allow-list or prose phrasing needed
  const memberLinks = sectionLinks.filter(l => l !== name)

  if (fieldRows.length === 0 && memberLinks.length > 0) {
    return {
      kind: 'union' as const,
      name,
      description,
      documentationLink: `https://core.telegram.org/bots/api#${name.toLowerCase()}`,
      members: [...(UNION_EXTRA_MEMBERS[name] ?? []), ...memberLinks.map(n => parseTypeRef(n))]
    }
  }

  // object tables: Field | Type | Description
  const fields: SchemaField[] = fieldRows.map((row) => {
    const cols = $(row).find('td').toArray()
    const fieldName = $(cols[0]).text().trim()
    const typeText = $(cols[1]).text().trim()
    const desc = $(cols[2]).text().trim()
    let type = parseTypeRef(typeText)

    // bot-api phrases string discriminators in prose ("can be either 'private', …", "always 'sender'")
    // instead of a machine-parseable enum — lift the values into `enumeration` for narrow typing
    if (type.kind === 'string' && !type.enumeration) {
      const literals = extractEnumeration(desc, fieldName)

      if (literals.length > 0) {
        type = { kind: 'string', enumeration: literals }
      }
    }

    return {
      name: fieldName,
      description: desc,
      required: !/^optional\.?\s/i.test(desc) && !OPTIONAL_FIELD_OVERRIDES[name]?.includes(fieldName),
      type
    }
  })

  return {
    kind: 'object' as const,
    name,
    description,
    documentationLink: `https://core.telegram.org/bots/api#${name.toLowerCase()}`,
    fields: dedupeFields(fields, name)
  }
}

function parseReturnTypeFromDescription (description: string, links: string[]) {
  // array-of-X first — telegram often phrases these as "an array of X objects is returned",
  // which the singular-type patterns below would otherwise miss
  const arrayPatterns: RegExp[] = [
    /Returns\s+(?:an?\s+|the\s+)?(Array of [A-Za-z]+)/,
    /On success,\s+returns\s+(?:an?\s+|the\s+)?(Array of [A-Za-z]+)/,
    /On success,\s+(?:an?\s+|the\s+)?[Aa]rray\s+of\s+([A-Z][A-Za-z]+)/,
    /[Rr]eturns?\s+(?:an?\s+|the\s+)?[Aa]rray\s+of\s+([A-Z][A-Za-z]+)/
  ]

  for (const pattern of arrayPatterns) {
    const match = description.match(pattern)

    if (match) {
      const captured = match[1]!.startsWith('Array of ') ? match[1]! : `Array of ${match[1]}`

      return parseTypeRef(captured)
    }
  }

  const patterns: RegExp[] = [
    /Returns[^.]*?\bas\s+(?:an?\s+)?(String|Integer|Int|Boolean|Bool|Float)\b/,
    /Returns\s+(?:an?\s+|the\s+)?([A-Z][A-Za-z]+)\s+on success/,
    /On success,\s+(?:an?\s+|the\s+)?([A-Z][A-Za-z]+)\s+is returned/,
    /On success,\s+returns\s+(?:an?\s+|the\s+)?([A-Z][A-Za-z]+)/,
    /Returns\s+(?:an?\s+|the\s+)?([A-Z][A-Za-z]+)/,
    /Returns\s+(True)\b/
  ]

  for (const pattern of patterns) {
    const match = description.match(pattern)

    if (match) {
      return parseTypeRef(match[1]!)
    }
  }

  // fallback for "returns the bot's information in form of a User object" — no identifier
  // near "Returns", description anchors carry the return type. last link wins
  if (links.length > 0) {
    return parseTypeRef(links[links.length - 1]!)
  }

  // unresolved. the caller defaults to `True` — the common no-return-value shape — rather than
  // throwing, since a genuinely True-returning method is legitimate and frequent
  return undefined
}

// trigger phrases for string-field allowed values; scoped to a sentence span so unrelated
// phrases ("Can be decrypted…") don't pull in adjacent quoted tokens
const ENUMERATION_TRIGGER = /\b(?:must be|can be|currently|always|one of|either)\b/i

// quoted token (smart quotes + ASCII double/single). multi-char tokens are lowercase-led
// identifiers / MIME types / file formats; single-char tokens cover label styles like “a” / “A” / “1”
const QUOTED_TOKEN = /[“"']([a-z][a-z0-9_/.-]*?[a-z0-9]|[a-zA-Z0-9])[”"']/g

// bot-api sentence boundary — `.` + whitespace + capital. caps the trigger span
const SENTENCE_BREAK = /\.\s+[A-Z]/

// disqualifies the trigger when followed by context prepositions (`for`/`in`/`with`/…) —
// "Can be available only for 'X' transactions" should not enumerate `data` over `X`
const CONTEXT_REFERENCE = /\b(?:for|in|when|where|with|during|to|from|as|by|on|only|provided)\b/i

// reliable single-value discriminators when bot-api drops the quotes ("must be X"/"always X").
// fallback when the quoted-multi-value extractor finds nothing
const UNQUOTED_DISCRIMINATOR_FIELDS = new Set(['type', 'status', 'source'])
const UNQUOTED_SINGLE_VALUE = /(?:must be|always)\s+["“']?([a-z][a-z0-9_]*)\b["”']?(?!\s+of\b)/i

function extractEnumeration (desc: string, fieldName: string) {
  const triggerMatch = ENUMERATION_TRIGGER.exec(desc)

  if (!triggerMatch) {
    return []
  }

  const tail = desc.slice(triggerMatch.index + triggerMatch[0].length)
  const breakMatch = SENTENCE_BREAK.exec(tail)
  const span = breakMatch ? tail.slice(0, breakMatch.index + 1) : tail

  const firstQuote = /[“"']/.exec(span)

  if (firstQuote) {
    const intermediate = span.slice(0, firstQuote.index)

    if (CONTEXT_REFERENCE.test(intermediate)) {
      return []
    }

    const seen: string[] = []

    for (const match of span.matchAll(QUOTED_TOKEN)) {
      const value = match[1]!

      if (!seen.includes(value)) {
        seen.push(value)
      }
    }

    if (seen.length > 0) {
      return seen
    }
  }

  // unquoted single-value fallback ("Type of the result, must be photo") — only on known discriminator fields
  if (UNQUOTED_DISCRIMINATOR_FIELDS.has(fieldName)) {
    const single = UNQUOTED_SINGLE_VALUE.exec(desc)

    if (single) {
      return [single[1]!]
    }
  }

  return []
}
