import * as filters from './filters'

export { Telegram } from './telegram'
export type { TelegramOptions } from './options'
export { TelegramError, ApiError } from './errors'
export type { ApiResponseError } from './errors'
export { MediaSource, MediaSourceTo, MediaSourceType, type MediaInput, type MediaInputTo } from './media-source'

export { createPlugin } from './plugins/plugin'
export type { Plugin } from './plugins/plugin'
export { PluginConflict, PluginCycle, PluginMissingDep } from './plugins/installer'

export type { HttpClient, HttpDownloadResponse, HttpRequestInput, HttpResponse } from './http/client'
export type { DownloadTarget } from './api/download'
export { resolveDownloadTarget } from './api/download'
export type {
  DispatchErrorContext,
  DispatchErrorHandler,
  ErrorContext,
  ErrorHandler,
  HookPriority,
  Middleware,
  RequestContext
} from './dispatch/hooks'
export type { AnyUpdate, OnOptions, Priority, UpdateHandler, UpdatePredicate } from './dispatch/on'
export type { StartPollingOptions } from './transport/polling'
export type {
  NodeWebhookCallback,
  ParsedRequest,
  WebhookHandler,
  WebhookOptions,
  WebhookResponse
} from './transport/webhook'
export type { DeleteWebhookOptions, SetWebhookOptions } from './transport/webhook/helpers'
export type { StartWebhookOptions, StartWebhookResult } from './transport/webhook/listener'

export { UnsupportedUpdate } from './dispatch/update-builder'
export { attach } from './dispatch/attach'

export * from './keyboards'
export * from './parse-mode'

export { filters }

export * from '@puregram/api'
