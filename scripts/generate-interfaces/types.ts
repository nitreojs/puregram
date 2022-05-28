export type SchemaType = 'integer' | 'string' | 'bool' | 'reference' | 'array' | 'float' | 'any_of'
export type SchemaInterfaceType = 'any_of' | 'properties'

export interface SchemaResponse {
  version: SchemaVersion
  recent_changes: SchemaRecentChanges
  methods: SchemaMethod[]
  objects: SchemaInterface[]
}

export interface SchemaVersion {
  major: number
  minor: number
  patch: number
}

export interface SchemaRecentChanges {
  year: number
  month: number
  day: number
}

export interface SchemaMethod {
  name: string
  description: string
  arguments?: SchemaObject[]
  multipart_only: boolean
  return_type: SchemaReturnType
  documentation_link: string
}

export type SchemaObject =
  | SchemaObjectReference
  | SchemaObjectInteger
  | SchemaObjectBool
  | SchemaObjectFloat
  | SchemaObjectAnyOf
  | SchemaObjectString
  | SchemaObjectArray

export interface SchemaObjectBase {
  name: string
  description: string
  required: boolean
  type: SchemaType
}

export interface SchemaObjectReference extends SchemaObjectBase {
  type: 'reference'
  reference: string

  // Is this reference internal (manually created)
  // so we don't need to add 'Telegram' before it?
  is_internal?: true
}

export interface SchemaObjectInteger extends SchemaObjectBase {
  type: 'integer'
  default?: number
  min?: number
  max?: number
}

export interface SchemaObjectBool extends SchemaObjectBase {
  type: 'bool'
  default?: boolean
}

export interface SchemaObjectFloat extends SchemaObjectBase {
  type: 'float'
}

export interface SchemaObjectAnyOf extends SchemaObjectBase {
  type: 'any_of'
  any_of: SchemaObject[]
}

export interface SchemaObjectString extends SchemaObjectBase {
  type: 'string'
  default?: string
  enumeration?: string[]
}

export interface SchemaObjectArray extends SchemaObjectBase {
  type: 'array'
  array: SchemaObject
}

export type SchemaReturnType =
  | ReturnTypeReference
  | ReturnTypeArray
  | ReturnTypeAnyOf
  | ReturnTypeBool
  | ReturnTypeInteger
  | ReturnTypeString

export interface ReturnTypeReference {
  type: 'reference'
  reference: string
}

export interface ReturnTypeArray {
  type: 'array'
  array: SchemaReturnType
}

export interface ReturnTypeAnyOf {
  type: 'any_of'
  any_of: SchemaReturnType[]
}

export interface ReturnTypeBool {
  type: 'bool'
  default: boolean
}

export interface ReturnTypeInteger {
  type: 'integer'
}

export interface ReturnTypeString {
  type: 'string'
}

export type SchemaInterface =
  | SchemaInterfaceAnyOf
  | SchemaInterfaceProperties

export interface SchemaInterfaceBase {
  name: string
  description: string
  documentation_link: string
  type?: SchemaInterfaceType
}

export interface SchemaInterfaceAnyOf extends SchemaInterfaceBase {
  type: 'any_of'
  any_of: SchemaObject[]
}

export interface SchemaInterfaceProperties extends SchemaInterfaceBase {
  type: 'properties'
  properties: SchemaObject[]
}

export interface CurrencyData {
  code: string
  title: string
  symbol: string
  native: string
  thousands_sep: string
  decimal_sep: string
  symbol_left: boolean
  space_between: boolean
  exp: number
  min_amount: string
  max_amount: string
}

export interface CurrenciesResponse {
  [key: string]: CurrencyData
}
