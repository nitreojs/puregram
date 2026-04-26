import type { Schema, SchemaVersion } from '../schema-types'
import type { SchemaFragment } from './corefork'

// pick the newer-version side as primary so its descriptions / argument shapes win on conflict
export function mergeFragments (corefork: SchemaFragment, core: SchemaFragment): Omit<Schema, 'source'> {
  const [primary, secondary] = compareVersions(corefork.version, core.version) >= 0
    ? [corefork, core]
    : [core, corefork]

  const methodsByName = new Map<string, Schema['methods'][number]>()
  for (const m of secondary.methods) methodsByName.set(m.name, m)
  for (const m of primary.methods) methodsByName.set(m.name, m)

  const objectsByName = new Map<string, Schema['objects'][number]>()
  for (const o of secondary.objects) objectsByName.set(o.name, o)
  for (const o of primary.objects) objectsByName.set(o.name, o)

  return {
    version: primary.version,
    recentChanges: primary.recentChanges,
    methods: [...methodsByName.values()].sort((a, b) => a.name.localeCompare(b.name)),
    objects: [...objectsByName.values()].sort((a, b) => a.name.localeCompare(b.name))
  }
}

function compareVersions (a: SchemaVersion, b: SchemaVersion): number {
  if (a.major !== b.major) return a.major - b.major
  if (a.minor !== b.minor) return a.minor - b.minor
  return a.patch - b.patch
}
