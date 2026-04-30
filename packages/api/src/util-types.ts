/**
 * narrow `T` so the listed keys are non-undefined. paired with `this is Has<this, 'k'>`
 * type predicates on `hasX()` helpers — calling `hasText()` then accessing `update.text`
 * gives you `string` instead of `string | undefined`
 */
export type Has<T, K extends keyof T> = T & { [P in K]-?: Exclude<T[P], undefined> }

/**
 * flat key-replacement structural rebuild. mapped over `keyof Base | keyof Mod`,
 * preferring `Mod[K]` when present. unlike `Omit<Base, keyof Mod> & Mod`, this
 * form replaces class accessor signatures with the Mod's property type instead
 * of intersecting them — chained property access narrows correctly even when
 * `Base` is a wrapper class with `get x()` declarations
 *
 * used by per-kind dispatchers to type the handler argument as
 * `Modify<KindUpdate, ExtractMod<F>>` after a filter narrows the input
 */
export type Modify<Base, Mod> = {
  [K in keyof Base | keyof Mod]: K extends keyof Mod
    ? Mod[K]
    : K extends keyof Base ? Base[K] : never
}
