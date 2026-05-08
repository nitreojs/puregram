import * as api from '@puregram/api'

/* eslint-disable @typescript-eslint/no-explicit-any -- raw class refs differ per kind; widening is intentional */
type UpdateClass = new (raw: any, tg: any) => any
/* eslint-enable @typescript-eslint/no-explicit-any */

const apiExports = api as unknown as Record<string, unknown>
const SERVICE_FIELDS = new Set(api.SERVICE_EVENT_ORDER as readonly string[])

function pascalCase (snake: string) {
  return snake.split('_').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')
}

function classFor (field: string) {
  const cls = apiExports[`${pascalCase(field)}Update`]

  return typeof cls === 'function' ? cls as UpdateClass : undefined
}

export class UnsupportedUpdate {
  readonly kind = 'unknown' as const
  constructor (
    public readonly raw: unknown,
    public readonly rawKey: string,
    _tg: unknown
  ) {}
}

export function buildUpdate (rawUpdate: Record<string, unknown>, tg: unknown) {
  let primaryKey: string | undefined

  for (const k of Object.keys(rawUpdate)) {
    if (k !== 'update_id') {
      primaryKey = k; break
    }
  }

  if (primaryKey === undefined) {
    return new UnsupportedUpdate(rawUpdate, 'none', tg) as never
  }

  const cls = classFor(primaryKey)

  if (!cls) {
    return new UnsupportedUpdate(rawUpdate[primaryKey], primaryKey, tg) as never
  }

  const payload = rawUpdate[primaryKey] as Record<string, unknown>

  if (primaryKey === 'message' || primaryKey === 'edited_message' || primaryKey === 'channel_post' || primaryKey === 'edited_channel_post') {
    for (const field of api.SERVICE_EVENT_ORDER) {
      if (field in payload && payload[field] !== undefined) {
        const serviceCls = SERVICE_FIELDS.has(field) ? classFor(field) : undefined

        if (serviceCls) {
          // eslint-disable-next-line new-cap, @typescript-eslint/no-unsafe-return -- runtime class lookup
          return new serviceCls(payload, tg)
        }
      }
    }
  }

  // eslint-disable-next-line new-cap, @typescript-eslint/no-unsafe-return -- runtime class lookup
  return new cls(payload, tg)
}
