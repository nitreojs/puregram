import { Telegram, createPlugin } from 'puregram'

const observer = createPlugin({
  name: 'observer',
  install (tg) {
    // request lifecycle: before -> intercept -> after
    // each request-phase hook receives a typed `RequestContext` with method, params, etc
    tg.useHook('onBeforeRequest', (ctx, next) => {
      console.log(`[before] ${ctx.method}`)

      return next()
    })

    tg.useHook('onRequestIntercept', (_ctx, next) => {
      console.log('[intercept]')

      return next()
    })

    tg.useHook('onResponseIntercept', (_ctx, next) => {
      console.log('[response intercept]')

      return next()
    })

    tg.useHook('onAfterRequest', (ctx, next) => {
      console.log(`[after] ${ctx.method}`)

      return next()
    })

    // dispatch lifecycle: fires for every update that enters the chain
    // `update` is `unknown` here — narrow with `update.kind === '...'` or `update instanceof MessageUpdate`
    tg.useHook('onUpdate', (update, next) => {
      console.log('[update]', (update as { kind: string }).kind)

      return next()
    })

    // process lifecycle: bookends around the bot's active lifetime
    tg.useHook('onInit', (_ctx, next) => {
      console.log('[init]')

      return next()
    })

    tg.useHook('onShutdown', (_ctx, next) => {
      console.log('[shutdown]')

      return next()
    })

    // error path: catches throws inside the http request pipeline
    tg.useHook('onError', (err, _ctx) => {
      console.error('[error]', err.message)
    })

    return {}
  }
})

const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(observer)

await telegram.startPolling()
