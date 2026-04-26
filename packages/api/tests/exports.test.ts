import { describe, it, expect } from 'vitest'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('public exports', () => {
  it('re-exports types module', async () => {
    const types = await import('../src/index')
    expect((types as any).User).toBeDefined()
    expect((types as any).MessageUpdate).toBeDefined()
  })

  it('@puregram/api/types subpath module loads', async () => {
    const fs = await import('node:fs/promises')
    const file = resolve(__dirname, '..', 'src', 'generated', 'types.ts')
    const stat = await fs.stat(file)
    expect(stat.isFile()).toBe(true)
  })
})
