import { fetch } from 'undici'

export interface FetchOptions {
  retries?: number
  timeoutMs?: number
}

export async function fetchHtml (url: string, options: FetchOptions = {}): Promise<string> {
  const retries = options.retries ?? 2
  const timeoutMs = options.timeoutMs ?? 30_000

  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const response = await fetch(url, { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`fetch ${url} → ${response.status}`)
        }

        return await response.text()
      } finally {
        clearTimeout(timeout)
      }
    } catch (error) {
      lastError = error

      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError
}
