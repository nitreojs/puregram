export interface HttpRequestInput {
  url: string
  init: RequestInit
}

export interface HttpResponse {
  status: number
  json: () => Promise<unknown>
}

export interface HttpDownloadResponse {
  status: number
  body: ReadableStream<Uint8Array> | null
}

export interface HttpClient {
  request: (input: HttpRequestInput) => Promise<HttpResponse>
  // optional binary GET — used by `tg.download(...)`. when a custom client omits it,
  // the download path falls back to native fetch
  download?: (url: string, init?: RequestInit) => Promise<HttpDownloadResponse>
}

export const defaultHttpClient: HttpClient = {
  async request (input) {
    const response = await fetch(input.url, input.init)

    return {
      status: response.status,
      json: () => response.json()
    }
  },

  async download (url, init) {
    const response = await fetch(url, init)

    return {
      status: response.status,
      body: response.body
    }
  }
}
