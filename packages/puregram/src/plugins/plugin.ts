import type { Telegram } from '../telegram'

export interface PluginSpec<N extends string, Ext> {
  readonly name: N
  readonly dependsOn?: readonly string[]
  install: (tg: Telegram<any>) => Ext | Promise<Ext>
}

export interface Plugin<N extends string = string, Ext = unknown> extends PluginSpec<N, Ext> {}

export function createPlugin<N extends string, Ext> (
  spec: PluginSpec<N, Ext>
): Plugin<N, Ext> {
  return spec
}
