import { format } from 'node:util'

export interface DebugFn {
  (template: string, ...args: unknown[]): void
  extend (suffix: string): DebugFn
}

function isEnabled (namespace: string): boolean {
  const env = process.env.PUREGRAM_DEBUG
  if (!env) return false

  const patterns = env.split(',').map(s => s.trim()).filter(Boolean)

  for (const pattern of patterns) {
    if (pattern === namespace) return true
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1)
      if (namespace.startsWith(prefix)) return true
    }
  }

  return false
}

export function createDebug (namespace: string): DebugFn {
  const fn = ((template: string, ...args: unknown[]) => {
    if (!isEnabled(namespace)) return
    const message = format(template, ...args)
    process.stderr.write(`${namespace} ${message}\n`)
  }) as DebugFn

  fn.extend = (suffix: string) => createDebug(`${namespace}:${suffix}`)

  return fn
}
