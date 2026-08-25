const POLL_INTERVAL_MS = 20

// generous ceiling — exits as soon as the condition holds, sized for contended ci runners
export const DEADLINE_MS = 10_000

export async function waitUntil (condition: () => boolean, deadlineMs = DEADLINE_MS) {
  const start = Date.now()

  while (!condition()) {
    if (Date.now() - start >= deadlineMs) {
      throw new Error(`waitUntil: condition not met within ${deadlineMs}ms`)
    }

    await new Promise<void>(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
  }
}
