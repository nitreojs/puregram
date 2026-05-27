import type { Schema, SchemaObject } from '../schema-types'

import { renderType } from './render-type'
import { cell, GENERATED_BANNER } from './shared'

function renderObject (object: SchemaObject) {
  const lines: string[] = [`## ${object.name}`, '']

  if (object.description) {
    lines.push(object.description, '')
  }

  if (object.kind === 'object') {
    if (object.fields.length > 0) {
      lines.push('| field | type | required | description |', '| --- | --- | :---: | --- |')

      for (const field of object.fields) {
        const required = field.required ? '✓' : ''

        lines.push(`| \`${field.name}\` | ${cell(renderType(field.type))} | ${required} | ${cell(field.description)} |`)
      }

      lines.push('')
    }
  } else if (object.kind === 'union') {
    lines.push(`one of: ${object.members.map(renderType).join(', ')}`, '')
  } else {
    lines.push(`one of: ${object.values.map(value => `\`${value}\``).join(', ')}`, '')
  }

  if (object.documentationLink) {
    lines.push(`[bot api reference →](${object.documentationLink})`, '')
  }

  return lines.join('\n')
}

export function emitObjectsPage (schema: Schema) {
  const head = [
    GENERATED_BANNER,
    '',
    '# objects',
    '',
    `the bot api objects, unions and enums (bot api ${schema.version.major}.${schema.version.minor}).`,
    ''
  ]

  const body = schema.objects.map(renderObject).join('\n')

  return `${head.join('\n')}\n${body}\n`
}
