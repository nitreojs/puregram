/**
 * lookup tables in the parsers are probed with attacker-controlled keys, and the tag-name grammar
 * matches `constructor` / `toString` / `valueOf`; a prototype chain would answer those probes with
 * a function instead of undefined, so every table drops its prototype
 */
export function lookupTable<T> (entries: Record<string, T>) {
  return Object.assign(Object.create(null) as Record<string, T>, entries) as Readonly<Record<string, T>>
}
