// re-export from `@puregram/api` so existing internal imports keep working.
// the canonical home for `CustomUpdate`/`CustomUpdateRegistry`/`AnyUpdate` is
// `@puregram/api/custom-update` — moved there so `Filter<T>`'s call signature
// can use `AnyUpdate` for its parameter without a reverse dependency on `puregram`

export { CustomUpdate, CustomUpdateRegistry } from '@puregram/api'
export type { AnyUpdate } from '@puregram/api'
