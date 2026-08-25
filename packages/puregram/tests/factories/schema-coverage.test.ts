import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { ChatAdministratorRights, ChatPermissions } from '../../src/factories'

const SCHEMA_DIR = join(import.meta.dirname, '../../../api/schema')

interface SchemaField {
  name: string
  required: boolean
}

function schemaFields (objectName: string) {
  const newest = readdirSync(SCHEMA_DIR)
    .filter(file => file.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .at(-1)

  expect(newest, `no schema json in ${SCHEMA_DIR}`).toBeDefined()

  const schema = JSON.parse(readFileSync(join(SCHEMA_DIR, newest!), 'utf8')) as {
    objects: { name: string, kind: string, fields?: SchemaField[] }[]
  }
  const object = schema.objects.find(o => o.name === objectName)

  expect(object?.fields, `${objectName} missing from the schema`).toBeDefined()

  return object!.fields!
}

// these factories carry hardcoded key lists, so a bot api bump that adds a field leaves
// allowAll() emitting an incomplete object — and the `as` cast inside them hides it from tsc
describe('permission factories cover the whole schema object', () => {
  it('ChatAdministratorRights.allowAll emits every field', () => {
    const fields = schemaFields('ChatAdministratorRights')
    const emitted = ChatAdministratorRights.allowAll() as unknown as Record<string, unknown>

    expect(Object.keys(emitted).sort()).toEqual(fields.map(f => f.name).sort())
  })

  it('ChatAdministratorRights.denyAll emits every required field', () => {
    const required = schemaFields('ChatAdministratorRights').filter(f => f.required).map(f => f.name)
    const emitted = ChatAdministratorRights.denyAll() as unknown as Record<string, unknown>

    expect(required.filter(name => !(name in emitted))).toEqual([])
  })

  it('ChatPermissions.allowAll emits every field', () => {
    const fields = schemaFields('ChatPermissions')
    const emitted = ChatPermissions.allowAll() as unknown as Record<string, unknown>

    expect(Object.keys(emitted).sort()).toEqual(fields.map(f => f.name).sort())
  })
})
