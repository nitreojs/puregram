import { MemoryStorage } from '@puregram/storage'
import { describe, expect, it } from 'vitest'

import {
  bumpAttempts,
  deleteRecord,
  isExpired,
  readRecord,
  writeRecord
} from '../../src/persistent/persist'
import type { PersistedFlow } from '../../src/persistent/types'

// eslint-disable-next-line local-rules/no-redundant-return-type -- factory annotated for explicit shape
const make = (extras: Partial<PersistedFlow> = {}): PersistedFlow => ({
  id: 'register:name',
  kind: 'message',
  chatId: 1,
  fromId: 2,
  payload: undefined,
  createdAt: 1000,
  ...extras
})

describe('persist helpers', () => {
  it('writeRecord + readRecord round-trip a record by triple', async () => {
    const storage = new MemoryStorage<PersistedFlow>()
    const record = make()

    await writeRecord(storage, record)

    const back = await readRecord(storage, 1, 2, 'message')

    expect(back).toEqual(record)
  })

  it('readRecord uses chatId/fromId/kind to compute the key', async () => {
    const storage = new MemoryStorage<PersistedFlow>()

    await writeRecord(storage, make({ fromId: undefined }))

    expect(await readRecord(storage, 1, 2, 'message')).toBeUndefined()
    expect(await readRecord(storage, 1, undefined, 'message')).toBeDefined()
  })

  it('deleteRecord removes by triple', async () => {
    const storage = new MemoryStorage<PersistedFlow>()

    await writeRecord(storage, make())
    await deleteRecord(storage, 1, 2, 'message')

    expect(await readRecord(storage, 1, 2, 'message')).toBeUndefined()
  })

  it('bumpAttempts increments and writes back', async () => {
    const storage = new MemoryStorage<PersistedFlow>()

    await writeRecord(storage, make())
    await bumpAttempts(storage, make())

    expect((await readRecord(storage, 1, 2, 'message'))!.attempts).toBe(1)

    await bumpAttempts(storage, (await readRecord(storage, 1, 2, 'message'))!)

    expect((await readRecord(storage, 1, 2, 'message'))!.attempts).toBe(2)
  })

  it('isExpired returns true only when expiresAt < now', () => {
    expect(isExpired(make({ expiresAt: 500 }), 1000)).toBe(true)
    expect(isExpired(make({ expiresAt: 1500 }), 1000)).toBe(false)
    expect(isExpired(make({ expiresAt: undefined }), 1000)).toBe(false)
  })
})
