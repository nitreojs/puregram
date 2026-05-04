type CamelKey<K extends string> = K extends `${infer Head}_${infer Rest}`
  ? `${Head}${Capitalize<CamelKey<Rest>>}`
  : K

/** map a snake_case-keyed type to its camelCase-keyed equivalent (top-level only) */
export type Camelize<T> = T extends object
  ? { [K in keyof T as CamelKey<K & string>]: T[K] }
  : T

function camelToSnake (key: string) {
  return key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())
}

/** shallow camelCase → snake_case key translation; values pass through untouched */
export function unCamelize<T extends object> (params: T): Record<string, unknown> {
  const out: Record<string, unknown> = {}

  for (const key of Object.keys(params)) {
    out[camelToSnake(key)] = (params as Record<string, unknown>)[key]
  }

  return out
}
