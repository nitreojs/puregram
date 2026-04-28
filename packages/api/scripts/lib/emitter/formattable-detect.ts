import type { Schema, SchemaField, SchemaObject, SchemaTypeRef } from '../schema-types'

export interface FormattableSlot {
  path: string[]
  textKey: string
  entitiesKey: string
}

function isStringType (ref: SchemaTypeRef) {
  return ref.kind === 'string'
}

function isMessageEntityArray (ref: SchemaTypeRef) {
  return ref.kind === 'array' && ref.of.kind === 'reference' && ref.of.name === 'MessageEntity'
}

function refToObjectName (ref: SchemaTypeRef) {
  if (ref.kind === 'reference') {
    return { name: ref.name, isArray: false }
  }

  if (ref.kind === 'array' && ref.of.kind === 'reference' && ref.of.name !== 'MessageEntity') {
    return { name: ref.of.name, isArray: true }
  }

  return null
}

function pairedEntitiesKey (textFieldName: string, entityFieldNames: ReadonlySet<string>) {
  // primary rule: <name>_entities sibling
  const suffixed = `${textFieldName}_entities`

  if (entityFieldNames.has(suffixed)) {
    return suffixed
  }

  // special case for the "text" field: paired with the bare "entities" array
  if (textFieldName === 'text' && entityFieldNames.has('entities')) {
    return 'entities'
  }

  return null
}

function findSlots (
  fields: readonly SchemaField[],
  pathSoFar: readonly string[],
  objectsByName: Map<string, SchemaObject>,
  visited: ReadonlySet<string>
): FormattableSlot[] {
  const slots: FormattableSlot[] = []
  const stringFields: string[] = []
  const entityFieldNames = new Set<string>()

  for (const f of fields) {
    if (isStringType(f.type)) {
      stringFields.push(f.name)
    }

    if (isMessageEntityArray(f.type)) {
      entityFieldNames.add(f.name)
    }
  }

  for (const name of stringFields) {
    const sibling = pairedEntitiesKey(name, entityFieldNames)

    if (sibling !== null) {
      slots.push({ path: [...pathSoFar, name], textKey: name, entitiesKey: sibling })
    }
  }

  // recurse into nested object/array-of-object fields
  for (const f of fields) {
    const inner = refToObjectName(f.type)

    if (inner === null) {
      continue
    }

    if (visited.has(inner.name)) {
      continue
    }

    const obj = objectsByName.get(inner.name)

    if (obj === undefined || obj.kind !== 'object') {
      continue
    }

    const nextPath = inner.isArray ? [...pathSoFar, f.name, '*'] : [...pathSoFar, f.name]
    const nextVisited = new Set([...visited, inner.name])

    slots.push(...findSlots(obj.fields, nextPath, objectsByName, nextVisited))
  }

  return slots
}

/** scans every method's arguments and returns a method→slots map describing every paired text/*_entities field */
export function detectFormattableFields (schema: Schema) {
  const objectsByName = new Map<string, SchemaObject>()

  for (const obj of schema.objects) {
    objectsByName.set(obj.name, obj)
  }

  const out = new Map<string, FormattableSlot[]>()

  for (const method of schema.methods) {
    const slots = findSlots(method.arguments, [], objectsByName, new Set())

    if (slots.length > 0) {
      out.set(method.name, slots)
    }
  }

  return out
}

/** returns the set of object names that are reachable from any method's argument list */
export function detectOutgoingObjectNames (schema: Schema) {
  const objectsByName = new Map(schema.objects.map(o => [o.name, o] as const))
  const reached = new Set<string>()

  const walkRef = (ref: SchemaTypeRef): void => {
    if (ref.kind === 'reference' && !reached.has(ref.name)) {
      reached.add(ref.name)

      const obj = objectsByName.get(ref.name)

      if (obj === undefined) {
        return
      }

      if (obj.kind === 'object') {
        for (const f of obj.fields) {
          walkRef(f.type)
        }
      } else if (obj.kind === 'union') {
        for (const m of obj.members) {
          walkRef(m)
        }
      }
    } else if (ref.kind === 'array') {
      walkRef(ref.of)
    } else if (ref.kind === 'union') {
      for (const m of ref.of) {
        walkRef(m)
      }
    }
  }

  for (const method of schema.methods) {
    for (const a of method.arguments) {
      walkRef(a.type)
    }
  }

  return reached
}

function widenedFieldsForFields (fields: readonly SchemaField[]) {
  const stringFields: string[] = []
  const entityFieldNames = new Set<string>()

  for (const f of fields) {
    if (isStringType(f.type)) {
      stringFields.push(f.name)
    }

    if (isMessageEntityArray(f.type)) {
      entityFieldNames.add(f.name)
    }
  }

  const widened = new Set<string>()

  for (const name of stringFields) {
    if (pairedEntitiesKey(name, entityFieldNames) !== null) {
      widened.add(name)
    }
  }

  return widened
}

/** returns the set of `text/caption/...` field names per object that should be widened to `string | Formattable` */
export function detectWidenedFieldsByObject (schema: Schema) {
  const out = new Map<string, Set<string>>()

  for (const obj of schema.objects) {
    if (obj.kind !== 'object') {
      continue
    }

    const widened = widenedFieldsForFields(obj.fields)

    if (widened.size > 0) {
      out.set(obj.name, widened)
    }
  }

  return out
}

/** returns the set of widened field names for a given method's argument list */
export function detectWidenedMethodArgs (schema: Schema) {
  const out = new Map<string, Set<string>>()

  for (const method of schema.methods) {
    const widened = widenedFieldsForFields(method.arguments)

    if (widened.size > 0) {
      out.set(method.name, widened)
    }
  }

  return out
}
