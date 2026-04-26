import * as cheerio from 'cheerio'
import type { SchemaField, SchemaMethod, SchemaObject, SchemaTypeRef } from '../schema-types'

const PRIMITIVE_MAP: Record<string, SchemaTypeRef> = {
  'Integer': { kind: 'integer' },
  'Int': { kind: 'integer' },
  'String': { kind: 'string' },
  'Boolean': { kind: 'bool' },
  'Bool': { kind: 'bool' },
  'Float': { kind: 'float' },
  'Float number': { kind: 'float' },
  'True': { kind: 'true' }
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

function splitUnion (text: string): string[] {
  // bot-api docs use simple comma + or/and at the top level — no nested unions inside an "Array of X"
  return text.split(/\s*,\s*|\s+or\s+|\s+and\s+/g).map(s => s.trim()).filter(Boolean)
}

export interface ExtractedSchema {
  methods: SchemaMethod[]
  objects: SchemaObject[]
}

export function extractFromHtml (html: string): ExtractedSchema {
  const $ = cheerio.load(html)

  const methods: SchemaMethod[] = []
  const objects: SchemaObject[] = []

  $('h4').each((_, h4) => {
    const $h4 = $(h4)
    const name = $h4.text().trim()

    if (!name) return

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

function isMethodName (name: string): boolean {
  return /^[a-z][a-zA-Z0-9]*$/.test(name)
}

function isObjectName (name: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name)
}

function findSectionTable ($: cheerio.CheerioAPI, $h4: cheerio.Cheerio<any>): cheerio.Cheerio<any> {
  let $cursor = $h4.next()
  while ($cursor.length) {
    const tag = ($cursor[0] as any).tagName?.toUpperCase()
    if (tag === 'H4' || tag === 'H3') break
    if (tag === 'TABLE') return $cursor
    $cursor = $cursor.next()
  }
  return $('<table></table>').remove()
}

function collectDescription (_$: cheerio.CheerioAPI, $h4: cheerio.Cheerio<any>): string {
  const parts: string[] = []
  let $cursor = $h4.next()

  while ($cursor.length) {
    const tag = ($cursor[0] as any).tagName?.toUpperCase()
    if (tag === 'H4' || tag === 'H3' || tag === 'TABLE') break
    if (tag === 'P') {
      parts.push($cursor.text().trim())
    }
    $cursor = $cursor.next()
  }

  return parts.join('\n').trim()
}

// recovers union members for objects like `BackgroundFill` that list variants in adjacent `<ul>`
function collectSectionLinks ($: cheerio.CheerioAPI, $h4: cheerio.Cheerio<any>): string[] {
  const links: string[] = []
  let $cursor = $h4.next()

  while ($cursor.length) {
    const tag = ($cursor[0] as any).tagName?.toUpperCase()
    if (tag === 'H4' || tag === 'H3') break
    if (tag === 'P' || tag === 'UL' || tag === 'OL') {
      $cursor.find('a').each((_, a) => {
        const text = $(a).text().trim()
        if (/^[A-Z][A-Za-z0-9]*$/.test(text) && !links.includes(text)) links.push(text)
      })
    }
    $cursor = $cursor.next()
  }

  return links
}

function collectDescriptionLinks ($: cheerio.CheerioAPI, $h4: cheerio.Cheerio<any>): string[] {
  const links: string[] = []
  let $cursor = $h4.next()

  while ($cursor.length) {
    const tag = ($cursor[0] as any).tagName?.toUpperCase()
    if (tag === 'H4' || tag === 'H3' || tag === 'TABLE') break
    if (tag === 'P') {
      $cursor.find('a').each((_, a) => {
        const text = $(a).text().trim()
        if (/^[A-Z][A-Za-z0-9]*$/.test(text)) links.push(text)
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
  $table: cheerio.Cheerio<any>
): SchemaMethod {
  const argumentRows = $table.find('tbody > tr').toArray()

  // method tables: Parameter | Type | Required | Description
  const arguments_: SchemaField[] = argumentRows.map(row => {
    const cols = $(row).find('td').toArray()
    const fieldName = $(cols[0]).text().trim()
    const typeText = $(cols[1]).text().trim()
    const requiredText = $(cols[2]).text().trim()
    const desc = $(cols[3]).text().trim()
    return {
      name: fieldName,
      description: desc,
      required: /yes/i.test(requiredText),
      type: parseTypeRef(typeText)
    }
  })

  const returnType = parseReturnTypeFromDescription(description, descriptionLinks)

  return {
    name,
    description,
    documentationLink: `https://core.telegram.org/bots/api#${name.toLowerCase()}`,
    multipartOnly: /multipart/i.test(description),
    arguments: arguments_,
    returnType
  }
}

function extractObject (
  $: cheerio.CheerioAPI,
  name: string,
  description: string,
  sectionLinks: string[],
  $table: cheerio.Cheerio<any>
): SchemaObject {
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
      kind: 'union',
      name,
      description,
      documentationLink: `https://core.telegram.org/bots/api#${name.toLowerCase()}`,
      members
    }
  }

  // object tables: Field | Type | Description
  const fields: SchemaField[] = fieldRows.map(row => {
    const cols = $(row).find('td').toArray()
    const fieldName = $(cols[0]).text().trim()
    const typeText = $(cols[1]).text().trim()
    const desc = $(cols[2]).text().trim()
    let type = parseTypeRef(typeText)

    // single-value discriminators ("must be photo", "always 'sender'") — bot-api uses prose,
    // not explicit enums. detect and narrow string types to a literal union of one value
    // so factory codegen and discriminated-union typing both work
    if (type.kind === 'string' && !type.enumeration && fieldName === 'type') {
      const single = desc.match(/(?:must be|always)\s+["']?([a-z][a-z0-9_]*)["']?/i)
      if (single) {
        type = { kind: 'string', enumeration: [single[1]] }
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
    kind: 'object',
    name,
    description,
    documentationLink: `https://core.telegram.org/bots/api#${name.toLowerCase()}`,
    fields
  }
}

function parseReturnTypeFromDescription (description: string, links: string[]): SchemaTypeRef {
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
    if (match) return parseTypeRef(match[1])
  }

  // fallback for phrasings like "returns the bot's information in form of a User object" —
  // no identifier near "Returns", but the description anchors the actual return type. last link wins
  if (links.length > 0) {
    return parseTypeRef(links[links.length - 1])
  }

  // most no-return-value methods document themselves as returning `True`
  return { kind: 'true' }
}

function extractUnionMembersFromDescription (description: string): SchemaTypeRef[] {
  // require strict PascalCase identifiers — anything looser (e.g. "the menu button opens") false-matches
  const match = description.match(/one of[\s\S]*?:\s*([A-Z][A-Za-z0-9]+(?:\s*,\s*[A-Z][A-Za-z0-9]+)*(?:\s*(?:,|\sand)\s*[A-Z][A-Za-z0-9]+)?)/)
  if (!match) return []

  const candidates = match[1]
    .split(/\s*,\s*|\s+and\s+|\s+or\s+/g)
    .map(s => s.trim())
    .filter(s => /^[A-Z][A-Za-z0-9]+$/.test(s))

  if (candidates.length === 0) return []
  return candidates.map(name => parseTypeRef(name))
}
