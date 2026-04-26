// e.g. { emit: 'InputMedia', prefix: 'InputMedia' } picks up every schema object whose name
// starts with 'InputMedia' and has a discriminating `type` field
export interface FactoryFamily {
  emit: string
  prefix: string
}

export const FACTORY_FAMILIES: FactoryFamily[] = [
  { emit: 'InputMedia',              prefix: 'InputMedia' },
  { emit: 'InlineQueryResult',       prefix: 'InlineQueryResult' },
  { emit: 'InlineQueryResultCached', prefix: 'InlineQueryResultCached' },
  { emit: 'InputMessageContent',     prefix: 'InputMessageContent' }
]
