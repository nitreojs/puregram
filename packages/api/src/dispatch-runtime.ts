/**
 * middleware-style handler — call `next()` to continue the chain, return without
 * calling it to halt. registration order is execution order
 */
export type UpdateHandler<U = unknown> = (
  update: U,
  next: () => Promise<void>
) => unknown

/** dispatch priority slot. `'high'` runs before user handlers, `'low'` runs after */
export type Priority = 'high' | 'normal' | 'low'

/** options accepted by every dispatcher method (per-kind, `tg.onUpdate`, `tg.use`) */
export interface OnOptions {
  priority?: Priority
}
