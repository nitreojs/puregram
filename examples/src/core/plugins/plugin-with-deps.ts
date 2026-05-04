import { Telegram, createPlugin } from 'puregram'

// declare hard dependencies via `dependsOn`
// `.extend` order doesn't matter — `dependsOn` resolves install order topologically
// missing deps throw `PluginMissingDep` at install; cycles throw `PluginCycle`
const base = createPlugin({
  name: 'base',
  install () {
    return {
      now: () => Date.now()
    }
  }
})

const consumer = createPlugin({
  name: 'consumer',
  dependsOn: ['base'],
  install (tg) {
    // `tg.base` is guaranteed installed by the time `install` runs
    // cast needed because `dependsOn` is runtime-only — tg's static type doesn't widen yet
    const baseTg = tg as Telegram & { base: { now: () => number } }

    return {
      timestamp: () => `now=${baseTg.base.now()}`
    }
  }
})

const telegram = Telegram
  .fromToken(process.env.TOKEN!)
  .extend(consumer) // order intentionally inverted — `dependsOn` handles it
  .extend(base)

console.log(telegram.consumer.timestamp())

await telegram.startPolling()
