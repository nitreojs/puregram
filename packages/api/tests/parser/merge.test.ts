import { describe, it, expect } from 'vitest'

import type { SchemaFragment } from '../../scripts/lib/parser/corefork'
import { mergeFragments } from '../../scripts/lib/parser/merge'

const baseFragment: SchemaFragment = {
  version: { major: 8, minor: 0, patch: 0 },
  recentChanges: { year: 2026, month: 4, day: 1 },
  methods: [],
  objects: [],
  returnTypeFallbacks: []
}

describe('mergeFragments', () => {
  it('prefers the newer-version fragment on conflict', () => {
    const corefork: SchemaFragment = {
      ...baseFragment,
      version: { major: 9, minor: 4, patch: 0 },
      methods: [{
        name: 'sendMessage',
        description: 'corefork desc',
        documentationLink: 'cf',
        multipartOnly: false,
        arguments: [],
        returnType: { kind: 'reference', name: 'Message' }
      }]
    }
    const core: SchemaFragment = {
      ...baseFragment,
      version: { major: 9, minor: 6, patch: 0 },
      methods: [{
        name: 'sendMessage',
        description: 'core desc',
        documentationLink: 'co',
        multipartOnly: false,
        arguments: [],
        returnType: { kind: 'reference', name: 'Message' }
      }]
    }

    const schema = mergeFragments(corefork, core)

    expect(schema.methods).toHaveLength(1)
    expect(schema.methods[0].description).toBe('core desc')
    expect(schema.version.minor).toBe(6)
  })

  it('prefers corefork when corefork is newer', () => {
    const corefork: SchemaFragment = {
      ...baseFragment,
      version: { major: 9, minor: 7, patch: 0 },
      methods: [{
        name: 'sendMessage',
        description: 'corefork desc',
        documentationLink: 'cf',
        multipartOnly: false,
        arguments: [],
        returnType: { kind: 'reference', name: 'Message' }
      }]
    }
    const core: SchemaFragment = {
      ...baseFragment,
      version: { major: 9, minor: 6, patch: 0 },
      methods: [{
        name: 'sendMessage',
        description: 'core desc',
        documentationLink: 'co',
        multipartOnly: false,
        arguments: [],
        returnType: { kind: 'reference', name: 'Message' }
      }]
    }

    const schema = mergeFragments(corefork, core)

    expect(schema.methods[0].description).toBe('corefork desc')
    expect(schema.version.minor).toBe(7)
  })

  it('breaks tied versions by recentChanges date', () => {
    const corefork: SchemaFragment = {
      ...baseFragment,
      version: { major: 9, minor: 6, patch: 0 },
      recentChanges: { year: 2026, month: 3, day: 1 },
      methods: [{
        name: 'sendMessage',
        description: 'corefork desc',
        documentationLink: 'cf',
        multipartOnly: false,
        arguments: [],
        returnType: { kind: 'reference', name: 'Message' }
      }]
    }
    const core: SchemaFragment = {
      ...baseFragment,
      version: { major: 9, minor: 6, patch: 0 },
      recentChanges: { year: 2026, month: 4, day: 15 },
      methods: [{
        name: 'sendMessage',
        description: 'core desc',
        documentationLink: 'co',
        multipartOnly: false,
        arguments: [],
        returnType: { kind: 'reference', name: 'Message' }
      }]
    }

    const schema = mergeFragments(corefork, core)

    expect(schema.methods[0].description).toBe('core desc')
  })

  it('keeps corefork-only and core-only entries', () => {
    const corefork: SchemaFragment = {
      ...baseFragment,
      methods: [{ name: 'newBetaMethod', description: '', documentationLink: '', multipartOnly: false, arguments: [], returnType: { kind: 'true' } }]
    }
    const core: SchemaFragment = {
      ...baseFragment,
      methods: [{ name: 'oldStableMethod', description: '', documentationLink: '', multipartOnly: false, arguments: [], returnType: { kind: 'true' } }]
    }

    const schema = mergeFragments(corefork, core)

    expect(schema.methods.map(m => m.name).sort()).toEqual(['newBetaMethod', 'oldStableMethod'])
  })

  it('takes the return-type fallback verdict from the winning fragment', () => {
    const method = { name: 'sendThing', description: '', documentationLink: '', multipartOnly: false, arguments: [], returnType: { kind: 'true' as const } }
    const corefork: SchemaFragment = {
      ...baseFragment,
      version: { major: 9, minor: 7, patch: 0 },
      methods: [method],
      returnTypeFallbacks: []
    }
    const core: SchemaFragment = {
      ...baseFragment,
      version: { major: 9, minor: 6, patch: 0 },
      methods: [method, { ...method, name: 'coreOnly' }],
      returnTypeFallbacks: ['sendThing', 'coreOnly']
    }

    expect(mergeFragments(corefork, core).returnTypeFallbacks).toEqual(['coreOnly'])
  })
})
