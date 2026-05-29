import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const register = fileURLToPath(new URL('./register-trap.mjs', import.meta.url))
const entry = fileURLToPath(new URL('../../src/index.ts', import.meta.url))

describe('edge readiness', () => {
  // the entry must load on runtimes without a filesystem or http server
  // (cloudflare workers, deno deploy, ...). node:fs / node:http belong behind
  // lazy `await import(...)` in the few methods that need them — never on the
  // import graph. a child node process imports the entry under a resolution hook
  // that throws if either is pulled in eagerly
  it('importing the entry pulls in no eager node:fs / node:http', () => {
    expect(() => {
      execFileSync(process.execPath, [
        '--import', 'tsx',
        '--import', register,
        '--input-type=module',
        '--eval', `await import(${JSON.stringify(entry)})`
      ], { stdio: 'pipe' })
    }).not.toThrow()
  })
})
