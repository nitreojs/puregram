import type { Schema, SchemaMethod } from '../schema-types'

import { renderType } from './render-type'
import { cell, GENERATED_BANNER } from './shared'

function renderMethod (method: SchemaMethod) {
  const lines: string[] = [`## ${method.name}`, '']

  if (method.description) {
    lines.push(method.description, '')
  }

  if (method.arguments.length > 0) {
    lines.push('| parameter | type | required | description |', '| --- | --- | :---: | --- |')

    for (const argument of method.arguments) {
      const required = argument.required ? '✓' : ''

      lines.push(`| \`${argument.name}\` | ${cell(renderType(argument.type))} | ${required} | ${cell(argument.description)} |`)
    }

    lines.push('')
  }

  lines.push(`**returns:** ${renderType(method.returnType)}`, '')

  if (method.documentationLink) {
    lines.push(`[bot api reference →](${method.documentationLink})`, '')
  }

  return lines.join('\n')
}

export function emitMethodsPage (schema: Schema) {
  const head = [
    GENERATED_BANNER,
    '',
    '# methods',
    '',
    `the raw bot api methods available on \`tg.api.*\` (bot api ${schema.version.major}.${schema.version.minor}).`,
    ''
  ]

  const body = schema.methods.map(renderMethod).join('\n')

  return `${head.join('\n')}\n${body}\n`
}
