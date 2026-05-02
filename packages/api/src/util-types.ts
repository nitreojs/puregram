/**
 * narrow `T` so the listed keys are non-undefined. paired with
 * `this is Has<this, 'k'>` predicates on `hasX()` helpers — `hasText()` then
 * `update.text` is `string`, not `string | undefined`
 */
export type Has<T, K extends keyof T> = T & { [P in K]-?: Exclude<T[P], undefined> }

/**
 * key-replacement intersection — `Omit` strips the keys `Mod` overrides
 * (including class accessor signatures, which a plain `Base & Mod` would leave
 * intact and re-widen chained access), then re-adds them at `Mod`'s types.
 * keys not in `Mod` stay on the `Base` side, so class identity carries through
 *
 * literal-discriminator narrowing (`chat: PrivateChat`) needs the same `Omit`
 * trick on the subtype alias itself — `emit-structures.ts` follows this pattern
 */
export type Modify<Base, Mod> = Omit<Base, keyof Mod> & Mod
