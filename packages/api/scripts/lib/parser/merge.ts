import type { Schema, SchemaVersion, SchemaRecentChanges } from '../schema-types'

import type { SchemaFragment } from './corefork'

// pick the newer-version side as primary; tied versions fall back to whichever side
// reports a more recent `recentChanges` date so we don't randomly favour one source
export function mergeFragments (corefork: SchemaFragment, core: SchemaFragment) {
  const [primary, secondary] = pickPrimary(corefork, core) as [SchemaFragment, SchemaFragment]

  const methodsByName = new Map<string, Schema['methods'][number]>()
  const returnTypeFallbacks = new Set<string>()

  // secondary first, so a method present on both sides takes the primary's fallback verdict too
  for (const fragment of [secondary, primary]) {
    const fragmentFallbacks = new Set(fragment.returnTypeFallbacks)

    for (const m of fragment.methods) {
      methodsByName.set(m.name, m)

      if (fragmentFallbacks.has(m.name)) {
        returnTypeFallbacks.add(m.name)
      } else {
        returnTypeFallbacks.delete(m.name)
      }
    }
  }

  const objectsByName = new Map<string, Schema['objects'][number]>()

  for (const o of secondary.objects) {
    objectsByName.set(o.name, o)
  }

  for (const o of primary.objects) {
    objectsByName.set(o.name, o)
  }

  return {
    version: primary.version,
    recentChanges: primary.recentChanges,
    methods: [...methodsByName.values()].sort((a, b) => a.name.localeCompare(b.name)),
    objects: [...objectsByName.values()].sort((a, b) => a.name.localeCompare(b.name)),
    returnTypeFallbacks: [...returnTypeFallbacks].sort((a, b) => a.localeCompare(b))
  }
}

function pickPrimary (corefork: SchemaFragment, core: SchemaFragment) {
  const cmp = compareVersions(corefork.version, core.version)

  if (cmp > 0) {
    return [corefork, core]
  }

  if (cmp < 0) {
    return [core, corefork]
  }

  const dateCmp = compareDates(corefork.recentChanges, core.recentChanges)

  if (dateCmp >= 0) {
    return [corefork, core]
  }

  return [core, corefork]
}

function compareVersions (a: SchemaVersion, b: SchemaVersion) {
  if (a.major !== b.major) {
    return a.major - b.major
  }

  if (a.minor !== b.minor) {
    return a.minor - b.minor
  }

  return a.patch - b.patch
}

function compareDates (a: SchemaRecentChanges, b: SchemaRecentChanges) {
  if (a.year !== b.year) {
    return a.year - b.year
  }

  if (a.month !== b.month) {
    return a.month - b.month
  }

  return a.day - b.day
}
