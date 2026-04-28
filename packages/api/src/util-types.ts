/**
 * narrow `T` so the listed keys are non-undefined. paired with `this is Has<this, 'k'>`
 * type predicates on `hasX()` helpers — calling `hasText()` then accessing `update.text`
 * gives you `string` instead of `string | undefined`
 */
export type Has<T, K extends keyof T> = T & { [P in K]-?: Exclude<T[P], undefined> }
