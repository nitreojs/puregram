// `{ emit: 'InputMedia', prefix: 'InputMedia' }` picks up every schema object starting
// with 'InputMedia' that has a discriminating `type` field
export interface FactoryFamily {
  emit: string
  prefix: string
}

// InputMessageContent is intentionally absent — its variants have no `type` discriminator
// and use mismatched naming, so puregram core hand-crafts that one
export const FACTORY_FAMILIES: FactoryFamily[] = [
  { emit: 'InputMedia', prefix: 'InputMedia' },
  { emit: 'InputPaidMedia', prefix: 'InputPaidMedia' },
  { emit: 'InputProfilePhoto', prefix: 'InputProfilePhoto' },
  { emit: 'InputStoryContent', prefix: 'InputStoryContent' },
  { emit: 'InlineQueryResult', prefix: 'InlineQueryResult' },
  { emit: 'InlineQueryResultCached', prefix: 'InlineQueryResultCached' }
]
