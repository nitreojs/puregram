/** scalar values supported by callback-data fields */
export type Accepted = string | number | boolean

/** field declaration kinds the encoder understands */
export type FieldType = 'string' | 'number' | 'boolean' | 'literal'

export interface FieldSpec {
  key: string
  type: FieldType
  optional: boolean
  default?: Accepted
  /** populated for `literal` fields */
  values?: readonly string[]
  /** ceil(log2(values.length)); populated for `literal` fields */
  bits?: number
}

export interface FieldOptions<Initial extends Accepted> {
  optional?: boolean
  default?: Initial
}

/** typescript helper that flattens intersection display in IDE hovers */
export type Simplify<T> = { [Key in keyof T]: T[Key] } & NonNullable<unknown>

/** map a field declaration into its contribution to the State type */
export type DetermineStateKey<T, Key extends string, Options> =
  Options extends ({ optional: true } | { default: T })
    ? { [P in Key]?: T }
    : { [P in Key]: T }
