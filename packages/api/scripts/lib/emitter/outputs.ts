import type { Schema } from '../schema-types'

import { emitApiMethods } from './emit-api-methods'
import { emitDispatch } from './emit-dispatch'
import { emitEnums } from './emit-enums'
import { emitFactories } from './emit-factories'
import { emitFilterTypes } from './emit-filter-types'
import { emitFilters } from './emit-filters'
import { emitFormattableFields } from './emit-formattable-fields'
import { emitInspect } from './emit-inspect'
import { emitMethodParams } from './emit-method-params'
import { emitMethods } from './emit-methods'
import { emitServiceEvents } from './emit-service-events'
import { emitShortcuts } from './emit-shortcuts'
import { emitStructures } from './emit-structures'
import { emitTypes } from './emit-types'
import { emitUpdates } from './emit-updates'
import { emitWebhookReplySafe } from './emit-webhook-reply-safe'

// single source of truth for generated/: emit writes exactly this, verify byte-compares exactly this
export function emitAll (schema: Schema) {
  const outputs: [string, string][] = [
    ['inspect.ts', emitInspect(schema)],
    ['types.ts', emitTypes(schema)],
    ['methods.ts', emitMethods(schema)],
    ['method-params.ts', emitMethodParams(schema)],
    ['api-methods.ts', emitApiMethods(schema)],
    ['enums.ts', emitEnums(schema)],
    ['structures.ts', emitStructures(schema)],
    ['updates.ts', emitUpdates(schema)],
    ['shortcuts.ts', emitShortcuts(schema)],
    ['service-events.ts', emitServiceEvents(schema)],
    ['factories.ts', emitFactories(schema)],
    ['formattable-fields.ts', emitFormattableFields(schema)],
    ['filters.ts', emitFilters(schema)],
    ['filter-types.ts', emitFilterTypes(schema)],
    ['dispatch.ts', emitDispatch(schema)],
    ['webhook-reply-safe.ts', emitWebhookReplySafe(schema)]
  ]

  return outputs
}
