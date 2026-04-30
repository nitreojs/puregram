import * as cheerio from 'cheerio'
import type { AnyNode } from 'domhandler'

import type { SchemaField, SchemaMethod, SchemaObject, SchemaTypeRef } from '../schema-types'

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

  // array first: commas inside the inner type stay scoped to a single splitUnion call
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

  if (PRIMITIVE_MAP[trimmed]) {
    return PRIMITIVE_MAP[trimmed]
  }

  if (/^[A-Z]/.test(trimmed)) {
    return { kind: 'reference', name: trimmed }
  }

  throw new Error(`unrecognized type: "${text}"`)
}

function splitUnion (text: string) {
  // bot-api docs use simple comma + or/and at the top level — no nested unions inside an "Array of X"
  return text.split(/\s*,\s*|\s+or\s+|\s+and\s+/g).map(s => s.trim()).filter(Boolean)
}

export interface ExtractedSchema {
  methods: SchemaMethod[]
  objects: SchemaObject[]
}

export function extractFromHtml (html: string) {
  const $ = cheerio.load(html)

  const methods: SchemaMethod[] = []
  const objects: SchemaObject[] = []

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
      methods.push(extractMethod($, name, description, descriptionLinks, $table))
    } else if (isObjectName(name)) {
      objects.push(extractObject($, name, description, sectionLinks, $table))
    }
    // names with spaces are section headers (e.g. "Available types"), ignore
  })

  return { methods, objects }
}

function isMethodName (name: string) {
  return /^[a-z][a-zA-Z0-9]*$/.test(name)
}

function isObjectName (name: string) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name)
}

// `AnyNode` is a discriminated union — only `Element` carries a tagName, so narrow
// before reading it. plain elements yield UPPER tag names; text/comment nodes yield undefined
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

// recovers union members for objects like `BackgroundFill` that list variants in adjacent `<ul>`
function collectSectionLinks ($: cheerio.CheerioAPI, $h4: cheerio.Cheerio<AnyNode>) {
  const links: string[] = []
  let $cursor = $h4.next()

  while ($cursor.length) {
    const tag = tagOf($cursor[0])

    if (tag === 'H4' || tag === 'H3') {
      break
    }

    if (tag === 'P' || tag === 'UL' || tag === 'OL') {
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

  return {
    name,
    description,
    documentationLink: `https://core.telegram.org/bots/api#${name.toLowerCase()}`,
    multipartOnly: /multipart/i.test(description),
    arguments: args,
    returnType
  }
}

function extractObject (
  $: cheerio.CheerioAPI,
  name: string,
  description: string,
  sectionLinks: string[],
  $table: cheerio.Cheerio<AnyNode>
) {
  const fieldRows = $table.find('tbody > tr').toArray()

  // some objects are unions (e.g. ChatMember, BackgroundFill) — they don't have field tables;
  // members live either inline ("must be one of: A, B, C") or in an adjacent <ul> list of links
  if (fieldRows.length === 0 && /one of/i.test(description)) {
    let members = extractUnionMembersFromDescription(description)

    if (members.length === 0 && sectionLinks.length > 0) {
      // exclude self-reference (the union name itself often appears in description anchors)
      members = sectionLinks.filter(l => l !== name).map(n => parseTypeRef(n))
    }

    return {
      kind: 'union' as const,
      name,
      description,
      documentationLink: `https://core.telegram.org/bots/api#${name.toLowerCase()}`,
      members
    }
  }

  // object tables: Field | Type | Description
  const fields: SchemaField[] = fieldRows.map((row) => {
    const cols = $(row).find('td').toArray()
    const fieldName = $(cols[0]).text().trim()
    const typeText = $(cols[1]).text().trim()
    const desc = $(cols[2]).text().trim()
    let type = parseTypeRef(typeText)

    // bot-api docs phrase string-discriminator constraints in prose ("can be either
    // 'private', 'group', 'supergroup' or 'channel'", "always 'sender'") rather than as a
    // machine-parseable enum. detect both single- and multi-value cases and lift the values
    // into the type ref's `enumeration`, so getter return types, factory dispatch, and
    // discriminated-union typing all narrow on literal-union ground truth instead of `string`
    if (type.kind === 'string' && !type.enumeration) {
      const literals = extractEnumeration(desc, fieldName)

      if (literals.length > 0) {
        type = { kind: 'string', enumeration: literals }
      }
    }

    return {
      name: fieldName,
      description: desc,
      required: !/^optional\.?\s/i.test(desc),
      type
    }
  })

  return {
    kind: 'object' as const,
    name,
    description,
    documentationLink: `https://core.telegram.org/bots/api#${name.toLowerCase()}`,
    fields
  }
}

function parseReturnTypeFromDescription (description: string, links: string[]) {
  // common phrasings:
  //   "Returns X" / "Returns an X" / "Returns the X"
  //   "On success, the X is returned" / "On success, returns X"
  //   "Returns True on success" / "Returns Array of X"
  const patterns: RegExp[] = [
    /Returns\s+(?:an?\s+|the\s+)?(Array of [A-Za-z]+)/,
    /Returns\s+(?:an?\s+|the\s+)?([A-Z][A-Za-z]+)\s+on success/,
    /On success,\s+(?:an?\s+|the\s+)?([A-Z][A-Za-z]+)\s+is returned/,
    /On success,\s+returns\s+(?:an?\s+|the\s+)?(Array of [A-Za-z]+)/,
    /On success,\s+returns\s+(?:an?\s+|the\s+)?([A-Z][A-Za-z]+)/,
    /Returns\s+(?:an?\s+|the\s+)?([A-Z][A-Za-z]+)/,
    /Returns\s+(True)\b/
  ]

  for (const pattern of patterns) {
    const match = description.match(pattern)

    if (match) {
      return parseTypeRef(match[1])
    }
  }

  // fallback for phrasings like "returns the bot's information in form of a User object" —
  // no identifier near "Returns", but the description anchors the actual return type. last link wins
  if (links.length > 0) {
    return parseTypeRef(links[links.length - 1])
  }

  // most no-return-value methods document themselves as returning `True`
  return { kind: 'true' as const }
}

// trigger phrases the bot-api docs use to introduce a string-field's allowed values.
// scoped to a sentence span so unrelated phrases like "Can be decrypted…" elsewhere in
// the description don't pull in adjacent quoted tokens
const ENUMERATION_TRIGGER = /\b(?:must be|can be|currently|always|one of|either)\b/i

// matches a quoted lowercase token. accepts smart quotes (“”), ASCII double, and
// ASCII single quotes. token shape covers identifiers, MIME types, and file formats —
// everything bot-api uses as a discriminator value
const QUOTED_TOKEN = /[“"']([a-z][a-z0-9_/.-]*?[a-z0-9])[”"']/g

// sentence break: full stop followed by a whitespace + capital letter, the bot-api
// docs' conventional sentence boundary. caps the span at the start of the next sentence
const SENTENCE_BREAK = /\.\s+[A-Z]/

// disqualifies the trigger when followed by context-reference prepositions —
// "Can be available only for "X" transactions" should not enumerate `data` over `X`.
// the trigger is genuinely enumerative when followed by enum-list connectives like
// "either", "one of", direct values; not when followed by "for", "in", "with", etc
const CONTEXT_REFERENCE = /\b(?:for|in|when|where|with|during|to|from|as|by|on|only|provided)\b/i

// fieldNames that are reliable single-value discriminators when the description follows
// "must be X"/"always X" without quotes — bot-api occasionally drops the quotes for
// these specific roles. used only as a fallback when the quoted-multi-value extractor
// finds nothing
const UNQUOTED_DISCRIMINATOR_FIELDS = new Set(['type', 'status', 'source'])
const UNQUOTED_SINGLE_VALUE = /(?:must be|always)\s+["“']?([a-z][a-z0-9_]*)["”']?/i

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
      const value = match[1]

      if (!seen.includes(value)) {
        seen.push(value)
      }
    }

    if (seen.length > 0) {
      return seen
    }
  }

  // unquoted single-value fallback: "Type of the result, must be photo" — bot-api
  // occasionally writes these without quotes. only trusted on known discriminator fields
  if (UNQUOTED_DISCRIMINATOR_FIELDS.has(fieldName)) {
    const single = UNQUOTED_SINGLE_VALUE.exec(desc)

    if (single) {
      return [single[1]]
    }
  }

  return []
}

function extractUnionMembersFromDescription (description: string) {
  // require strict PascalCase identifiers — anything looser (e.g. "the menu button opens") false-matches
  const match = description.match(/one of[\s\S]*?:\s*([A-Z][A-Za-z0-9]+(?:\s*,\s*[A-Z][A-Za-z0-9]+)*(?:\s*(?:,|\sand)\s*[A-Z][A-Za-z0-9]+)?)/)

  if (!match) {
    return []
  }

  const candidates = match[1]
    .split(/\s*,\s*|\s+and\s+|\s+or\s+/g)
    .map(s => s.trim())
    .filter(s => /^[A-Z][A-Za-z0-9]+$/.test(s))

  if (candidates.length === 0) {
    return []
  }

  return candidates.map(name => parseTypeRef(name))
}
