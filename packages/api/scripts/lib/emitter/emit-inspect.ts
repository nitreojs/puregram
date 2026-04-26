import { formatModule } from './format'
import type { Schema } from '../schema-types'
import { versionString } from './load-schema'

const INSPECT_BODY = `
const INSPECT = Symbol.for('nodejs.util.inspect.custom')

export interface InspectableInput {
  className: string
  payload: Record<string, any>
  computed?: Record<string, any>
}

export function makeInspect (input: InspectableInput): string {
  const merged: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(input.payload)) {
    if (v === undefined || v === null) continue
    if (Array.isArray(v) && v.length === 0) continue
    merged[k] = v
  }
  for (const [k, v] of Object.entries(input.computed ?? {})) {
    if (v === undefined || v === null) continue
    merged[k] = v
  }
  const body = JSON.stringify(merged, null, 2)
  return \`\${input.className} \${body}\`
}

export { INSPECT }
`.trim()

export function emitInspect (schema: Schema): string {
  return formatModule({
    nodes: [],
    botApiVersion: versionString(schema),
    sourceUrl: schema.source.corefork,
    generatedAt: schema.source.fetchedAt
  }) + '\n' + INSPECT_BODY + '\n'
}
