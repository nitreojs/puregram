import type { SchemaTypeRef } from '../schema-types'

const objectAnchor = (name: string) => `/api/objects#${name.toLowerCase()}`

export function renderType (ref: SchemaTypeRef): string {
  switch (ref.kind) {
    case 'integer':
      return 'integer'
    case 'float':
      return 'float'
    case 'bool':
      return 'boolean'
    case 'true':
      return 'true'
    case 'string':
      return ref.enumeration?.length
        ? ref.enumeration.map(value => `\`${value}\``).join(' | ')
        : 'string'
    case 'reference':
      return `[${ref.name}](${objectAnchor(ref.name)})`
    case 'array':
      return `${renderType(ref.of)}[]`
    case 'union':
      return ref.of.map(renderType).join(' | ')
  }
}
