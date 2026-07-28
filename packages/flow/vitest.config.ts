import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    globals: false,
    // must clear the waitUntil helper's 10s ceiling — otherwise a stuck poll-driven
    // test dies on the 5s default and reports "test timed out" instead of the assertion
    testTimeout: 15_000
  }
})
