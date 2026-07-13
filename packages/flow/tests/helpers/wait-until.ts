const POLL_INTERVAL_MS = 20
// generous ceiling — exits as soon as the condition holds, sized for contended ci runners
const DEADLINE_MS = 10_000

export async function waitUntil (condition: () => boolean, deadlineMs = DEADLINE_MS) {
  const start = Date.now()

  while (!condition() && Date.now() - start < deadlineMs) {
    await new Promise<void>(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
  }
}
