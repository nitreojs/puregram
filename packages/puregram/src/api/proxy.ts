import type { ApiMethods } from '@puregram/api'
import type { ApiResponseError } from '../errors'

export type ApiCaller = (method: string, params?: Record<string, unknown>) => Promise<unknown>

interface SuppressAddition<B extends boolean | undefined> {
  /** if true, returns ApiResponseError instead of throwing on API errors */
  suppress?: B
}

type SuppressedReturn<R, B extends boolean | undefined> =
  void extends R ? void
    : undefined extends B ? R
    : false extends B ? R
    : R | ApiResponseError

type IsNullableParams<P> = unknown extends P ? true : undefined extends P ? true : false

type SuppressedMethod<M extends (...args: any[]) => Promise<any>> =
  M extends (params: infer P) => Promise<infer R>
    ? true extends IsNullableParams<P>
      ? <B extends boolean | undefined = undefined>(params?: P & SuppressAddition<B>) => Promise<SuppressedReturn<R, B>>
      : <B extends boolean | undefined = undefined>(params: P & SuppressAddition<B>) => Promise<SuppressedReturn<R, B>>
    : never

export type SuppressableApi = {
  [K in keyof ApiMethods]: SuppressedMethod<ApiMethods[K]>
}

export interface ApiCallEscape {
  call (method: string, params?: Record<string, unknown>): Promise<unknown>
}

export type TelegramApi = SuppressableApi & ApiCallEscape

export function createApiProxy (caller: ApiCaller): TelegramApi {
  const target = {} as TelegramApi
  return new Proxy(target, {
    get (_target, prop: string) {
      if (prop === 'call') {
        return (method: string, params?: Record<string, unknown>) => caller(method, params)
      }
      return (params?: Record<string, unknown>) => caller(prop, params)
    }
  })
}
