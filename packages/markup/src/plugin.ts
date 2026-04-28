import { FORMATTABLE_FIELDS } from '@puregram/api'
import { createPlugin, type RequestContext, type Telegram } from 'puregram'

import { unwrapFormatted, type FormattableFields } from './walk'

const FIELDS = FORMATTABLE_FIELDS as FormattableFields

export function markup () {
  return createPlugin({
    name: 'markup',
    install: (tg: Telegram) => {
      tg.useHook('onBeforeRequest', (raw, next) => {
        const ctx = raw as RequestContext

        unwrapFormatted(ctx.method, ctx.params, FIELDS)

        return next()
      })

      return {}
    }
  })
}
