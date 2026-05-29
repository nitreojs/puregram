import type { Schema, SchemaField } from '../schema-types'

/**
 * curated soft enums. these fields describe their allowed values in bot-api prose
 * (not a formal parameter enum), so the scraper stores them as bare `string`.
 * telegram matches them case-insensitively, so they must stay open — we surface the
 * known values for autocomplete via `'A' | 'B' | (string & {})` without making the
 * type strict
 */
const PARSE_MODE_VALUES = ['HTML', 'Markdown', 'MarkdownV2'] as const

// resolve the soft-enum values for a field name, or undefined if it isn't one.
// the `*_parse_mode` family (question_parse_mode, explanation_parse_mode, …) shares
// parse_mode's values
function softEnumValuesFor (name: string) {
  if (name === 'parse_mode' || name.endsWith('_parse_mode')) {
    return PARSE_MODE_VALUES
  }

  return undefined
}

function applyToField (field: SchemaField) {
  const values = softEnumValuesFor(field.name)

  if (values && field.type.kind === 'string') {
    field.type.enumeration = [...values]
    field.type.open = true
  }
}

/** mutate the schema in place, tagging curated soft-enum fields with values + `open` */
export function applySoftEnums (schema: Schema) {
  for (const method of schema.methods) {
    for (const arg of method.arguments) {
      applyToField(arg)
    }
  }

  for (const obj of schema.objects) {
    if (obj.kind === 'object') {
      for (const field of obj.fields) {
        applyToField(field)
      }
    }
  }
}
