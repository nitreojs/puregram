import type { Schema, SchemaTypeRef } from '../schema-types'

/**
 * curated method return-type narrowings. bot-api documents some returns more loosely than
 * reality, so the scraper records the broad type — these refine them at emit time, the same
 * way `applySoftEnums` refines string fields the docs only describe in prose.
 *
 * getChatAdministrators is documented as "Array of ChatMember", but a chat's administrators
 * can only ever be the owner or an administrator — never a plain/restricted/left/banned member
 */
const RETURN_OVERRIDES: Record<string, SchemaTypeRef> = {
  getChatAdministrators: {
    kind: 'array',
    of: {
      kind: 'union',
      of: [
        { kind: 'reference', name: 'ChatMemberOwner' },
        { kind: 'reference', name: 'ChatMemberAdministrator' }
      ]
    }
  }
}

/** mutate the schema in place, replacing curated method return types */
export function applyMethodReturnOverrides (schema: Schema) {
  for (const method of schema.methods) {
    const override = RETURN_OVERRIDES[method.name]

    if (override) {
      method.returnType = override
    }
  }
}
