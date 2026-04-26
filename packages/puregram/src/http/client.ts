export interface HttpRequestInput {
  url: string
  init: RequestInit
}

export interface HttpResponse {
  status: number
  json (): Promise<unknown>
}

export interface HttpClient {
  request (input: HttpRequestInput): Promise<HttpResponse>
}

export const defaultHttpClient: HttpClient = {
  async request (input) {
    const response = await fetch(input.url, input.init)
    return {
      status: response.status,
      json: () => response.json()
    }
  }
}
