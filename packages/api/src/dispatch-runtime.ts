// dispatch-side type primitives shared between `@puregram/api` (codegen consumes
// them in `dispatch.ts`) and `puregram` core (runtime dispatcher). lives in api
// to avoid `puregram` core depending on its own dispatcher types — codegen would
// otherwise need a reverse dep on the package it's generating types for

/**
 * middleware-style handler signature. receives the update and a `next` thunk;
 * calling `next()` lets the next registered handler run, returning without
 * calling `next()` halts the chain. order of registration is the order of execution
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
