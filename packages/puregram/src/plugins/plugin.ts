import type { Telegram } from '../telegram'

export interface Plugin<N extends string = string, Ext = unknown> {
  readonly name: N
  readonly dependsOn?: readonly string[]
  install: (tg: Telegram) => Ext | Promise<Ext>
}

export function createPlugin<N extends string, Ext> (spec: Plugin<N, Ext>) {
  return spec
}
