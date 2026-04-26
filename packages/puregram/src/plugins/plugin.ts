import type { Telegram } from '../telegram'

export interface PluginSpec<N extends string, Ext> {
  readonly name: N
  readonly dependsOn?: readonly string[]
  install: (tg: Telegram) => Ext | Promise<Ext>
}

export type Plugin<N extends string = string, Ext = unknown> = PluginSpec<N, Ext>

export function createPlugin<N extends string, Ext> (
  spec: PluginSpec<N, Ext>
) {
  return spec
}
