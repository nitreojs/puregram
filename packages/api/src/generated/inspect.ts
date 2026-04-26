/// AUTO-GENERATED FILE — do not edit by hand
/// Bot API 9.6.0
/// source: https://corefork.telegram.org/bots/api
/// generated at: 2026-04-26T09:30:18.745Z
/// see scripts/emit.ts in @puregram/api

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
  return `${input.className} ${body}`
}

export { INSPECT }
