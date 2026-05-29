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
    case 'string': {
      if (!ref.enumeration?.length) {
        return 'string'
      }

      const literals = ref.enumeration.map(value => `\`${value}\``).join(' | ')

      // soft enum stays assignable from any string — show that in the docs cell
      return ref.open ? `${literals} | string` : literals
    }
    case 'reference':
      return `[${ref.name}](${objectAnchor(ref.name)})`
    case 'array':
      return `${renderType(ref.of)}[]`
    case 'union':
      return ref.of.map(renderType).join(' | ')
  }
}
