/**
 * narrow `T` so the listed keys are non-undefined. paired with `this is Has<this, 'k'>`
 * type predicates on `hasX()` helpers — calling `hasText()` then accessing `update.text`
 * gives you `string` instead of `string | undefined`
 */
export type Has<T, K extends keyof T> = T & { [P in K]-?: Exclude<T[P], undefined> }

/**
 * key-replacement intersection. `Omit<Base, keyof Mod>` strips the keys Mod
 * overrides — including class accessor signatures, so chained property access
 * narrows on the new value type — then intersection adds them back at the Mod's
 * type. keys NOT in Mod stay on the Base side intact, so class identity carries
 * through (private fields, methods bound to `this: Base` are preserved)
 *
 * for narrowing on a literal-discriminator field (e.g. `chat: PrivateChat`), the
 * subtype alias must itself be `Omit<Class, 'discriminator'> & { discriminator: 'X' }`
 * — `Class & { discriminator: 'X' }` does not strip the class accessor either,
 * so chained access through that intermediate also widens. emit-structures.ts
 * codegen's subtype aliases follow this pattern
 *
 * used by per-kind dispatchers to type the handler argument as
 * `Modify<KindUpdate, ExtractMod<F>>` after a filter narrows the input
 */
export type Modify<Base, Mod> = Omit<Base, keyof Mod> & Mod
