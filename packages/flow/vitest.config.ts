import { defineConfig } from 'vitest/config'

import { DEADLINE_MS } from './tests/helpers/wait-until'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    globals: false,
    testTimeout: DEADLINE_MS * 2
  }
})
