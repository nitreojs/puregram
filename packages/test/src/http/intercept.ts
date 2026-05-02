import type { HttpClient, HttpRequestInput, Telegram } from 'puregram'

export type InterceptHandler = (
  method: string,
  params: Record<string, unknown>
) => unknown

const METHOD_RE = /\/bot[^/]+\/([a-zA-Z]+)(?:\?(.*))?$/

export class InterceptingHttpClient implements HttpClient {
  constructor (private readonly handler: InterceptHandler) {}

  async request (input: HttpRequestInput) {
    const { method, query } = parseUrl(input.url)
    const params = readParams(input, query)
    const envelope = await this.handler(method, params)

    return {
      status: 200,
      json: () => Promise.resolve(envelope)
    }
  }
}

function parseUrl (url: string) {
  const match = METHOD_RE.exec(url)
  const method = match?.[1]

  if (match === null || method === undefined) {
    throw new Error(`InterceptingHttpClient: unrecognized url ${url}`)
  }

  return { method, query: match[2] }
}

function readParams (input: HttpRequestInput, query: string | undefined) {
  if (query) {
    return parseQuery(query)
  }

  const body = input.init.body
  const contentType = readHeader(input.init.headers, 'content-type')

  if (typeof body === 'string' && contentType?.startsWith('application/json')) {
    try {
      return JSON.parse(body) as Record<string, unknown>
    } catch {
      return {}
    }
  }

  return {}
}

function parseQuery (q: string) {
  const usp = new URLSearchParams(q)
  const out: Record<string, unknown> = {}

  for (const [k, v] of usp.entries()) {
    try {
      out[k] = JSON.parse(v)
    } catch {
      out[k] = v
    }
  }

  return out
}

function readHeader (headers: HeadersInit | undefined, name: string) {
  if (!headers) {
    return undefined
  }

  const lower = name.toLowerCase()

  if (headers instanceof Headers) {
    return headers.get(name) ?? undefined
  }

  if (Array.isArray(headers)) {
    for (const [k, v] of headers) {
      if (k.toLowerCase() === lower) {
        return v
      }
    }

    return undefined
  }

  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === lower) {
      return v
    }
  }

  return undefined
}

interface InternalTelegram {
  httpClient: HttpClient
}

export function swapHttpClient (tg: Telegram, replacement: HttpClient) {
  const internal = tg as unknown as InternalTelegram
  const previous = internal.httpClient

  internal.httpClient = replacement

  return () => {
    internal.httpClient = previous
  }
}
