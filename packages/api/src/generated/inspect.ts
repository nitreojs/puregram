/// AUTO-GENERATED FILE — do not edit by hand
/// Bot API 9.6.0
/// source: https://corefork.telegram.org/bots/api
/// generated at: 2026-04-26T09:30:18.745Z
/// see scripts/emit.ts in @puregram/api

import type { InspectOptionsStylized } from 'node:util'

const INSPECT = Symbol.for('nodejs.util.inspect.custom')

type InspectFn = (value: unknown, options: InspectOptionsStylized) => string

const SKIP_KEYS = new Set(['raw', 'tg'])

export function makeInspect (
  className: string,
  instance: object,
  depth: number,
  options: InspectOptionsStylized,
  inspect: InspectFn
): string {
  const stylizedName = options.stylize(className, 'special')
  if (depth < 0) {
    return stylizedName
  }
  const fields = collectFields(instance)
  // forward node's options so the user's color/depth choices propagate to nested values;
  // manually decrement depth per the documented custom-inspect pattern
  const childOptions: InspectOptionsStylized = {
    ...options,
    depth: options.depth === null ? null : (options.depth ?? 2) - 1
  }
  // wrapper classes with no schema fields (e.g. ChatMember — empty union root) would render
  // as just `ClassName {}`; fall back to the raw payload so the user still sees the data
  if (Object.keys(fields).length === 0 && hasRawObject(instance)) {
    return `${stylizedName} ${inspect((instance as { raw: unknown }).raw, childOptions)}`
  }
  return `${stylizedName} ${inspect(fields, childOptions)}`
}

function collectFields (instance: object): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  // own enumerable fields first (kind discriminant on update classes lives here)
  for (const [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(instance))) {
    if (SKIP_KEYS.has(key) || key.startsWith('_')) continue
    if (desc.enumerable === false) continue
    let value: unknown
    if ('value' in desc) {
      value = desc.value
    } else if (typeof desc.get === 'function') {
      try { value = desc.get.call(instance) } catch { continue }
    } else {
      continue
    }
    if (typeof value === 'function') continue
    if (keep(value)) out[key] = value
  }
  // prototype getters second (the codegen'd camelCase fields)
  const proto = Object.getPrototypeOf(instance) as object | null
  if (proto && proto !== Object.prototype) {
    for (const [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
      if (key === 'constructor' || key in out) continue
      if (typeof desc.get !== 'function') continue
      let value: unknown
      try { value = desc.get.call(instance) } catch { continue }
      if (typeof value === 'function') continue
      if (keep(value)) out[key] = value
    }
  }
  return out
}

function keep (value: unknown): boolean {
  if (value === undefined || value === null) return false
  if (Array.isArray(value) && value.length === 0) return false
  return true
}

function hasRawObject (instance: object): boolean {
  const raw = (instance as { raw?: unknown }).raw
  return typeof raw === 'object' && raw !== null
}

export { INSPECT }
