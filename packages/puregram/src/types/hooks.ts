import type { RequestInit, Response } from 'undici'

import type { ApiResponseUnion } from './interfaces'
import type { MaybePromise } from './types'

export type RequestContext<T> = (context: T) => MaybePromise<T>

export interface BaseContext {
  controller: AbortController
  init: RequestInit
}

export interface BeforeRequestContext extends BaseContext {
  path: string
  params: Record<string, any>
}

export type OnBeforeRequestHandler = RequestContext<BeforeRequestContext>

export interface RequestInterceptHandler extends BeforeRequestContext {
  query: string
  url: string
}

export type OnRequestInterceptHandler = RequestContext<RequestInterceptHandler>

export interface ResponseInterceptHandler extends RequestInterceptHandler {
  response: Response
  json: ApiResponseUnion
}

export type OnResponseInterceptHandler = RequestContext<ResponseInterceptHandler>

export interface AfterRequestHandler extends ResponseInterceptHandler {}

export type OnAfterRequestHandler = RequestContext<AfterRequestHandler>

export interface ErrorHandler {
  error: Error
}

export type OnErrorHandler = RequestContext<ErrorHandler>

export interface Hooks {
  onBeforeRequest: OnBeforeRequestHandler[]
  onRequestIntercept: OnRequestInterceptHandler[]
  onResponseIntercept: OnResponseInterceptHandler[]
  onAfterRequest: OnAfterRequestHandler[]
  onError: OnErrorHandler[]
}

type Extract<T> = T extends Array<infer R> ? R : never

export type HookHandler = Extract<Hooks[keyof Hooks]>
export type HookContext = BeforeRequestContext | RequestInterceptHandler | ResponseInterceptHandler | AfterRequestHandler | ErrorHandler
