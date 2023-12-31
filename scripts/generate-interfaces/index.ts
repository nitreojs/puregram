import { writeFile, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { fetch } from 'undici'
import { stripIndent, stripIndents } from 'common-tags'

import * as Types from './types'

// const SCHEMA_URL = resolve(__dirname, 'custom.min.json')
const SCHEMA_URL = 'https://ark0f.github.io/tg-bot-api/custom.min.json'
const CURRENCIES_URL = 'https://core.telegram.org/bots/payments/currencies.json'

///           SERVICES           ///

interface ServiceResult {
  content: string
  name: string
}

interface ServiceResultInterface extends ServiceResult {
  fields: number
}

interface ServiceResultMethod extends ServiceResult {
  hasParams: boolean
}

interface GenerateFieldsResponse {
  fields: string[]
  types: ServiceResult[]
}

const uppercaseFirst = (string: string) => string[0].toUpperCase() + string.slice(1)
const undoSnakeCase = (string: string) => string.split('_').reduce(
  (prev, cur, i) => i === 0 ? cur : prev + uppercaseFirst(cur),
  ''
)

class InterfaceService {
  static async generate (kInterface: Types.SchemaInterface): Promise<ServiceResultInterface> {
    if (kInterface.type === 'any_of') {
      throw new TypeError('SchemaInterfaceAnyOf should be generated via TypeService.generate')
    }

    const name = `Telegram${kInterface.name}`
    const description = InterfaceService.generateDescription(kInterface.description)

    let content = `${description}\nexport interface ${name} { }`

    if (kInterface.properties) {
      const generateFieldsResponse = await InterfaceService.generateFields(kInterface)

      const fields = generateFieldsResponse.fields.map(tab)

      // just some little hacks over there, nothing special, scroll away
      fields.push('')
      fields.push(tab('[key: string]: any'))

      const iAdditionalTypes = generateFieldsResponse.types.length !== 0 ? generateFieldsResponse.types.map(e => e.content).join('\n') + '\n\n' : ''

      content = `${iAdditionalTypes}${description}\nexport interface ${name} {\n${fields.join('\n')}\n}`
    }

    return {
      content,
      name,
      fields: kInterface.properties?.length ?? 0
    }
  }

  static generateDescription (
    description: string,
    padSize = 0,
    documentationLink?: string
  ) {
    const parts = description.split(/\n/)
    const spaces = ' '.repeat(padSize)

    if (documentationLink) {
      parts.push('')
      parts.push('---')
      parts.push('')
      parts.push(`[**Documentation**](${documentationLink})`)
    }

    return `/**\n${parts.map(part => `${spaces} * ${part}`).join('\n')}\n${spaces} */`
  }

  static async generateFields (iface: Types.SchemaInterfaceProperties) {
    const response: GenerateFieldsResponse = {
      fields: [],
      types: []
    }

    // TODO: [field] or [property]?
    for (const field of iface.properties) {
      let type = TypeResolver.resolve(field)

      // INFO: current field type is enumeration of strings: [key: 'foo' | 'bar' | 'baz']
      if (field.type === 'string' && field.enumeration !== undefined) {
        const typeName = `Telegram${iface.name}${uppercaseFirst(undoSnakeCase(field.name))}`

        const sType: ServiceResult = {
          name: typeName,
          content: `export type ${typeName} = ${type}`
        }

        response.types.push(sType)

        // INFO: soften (is that even a word?) string enumerations by allowing any strings but keeping suggestions
        // INFO: see [SoftString<S>] type (puregram/src/types/types.ts)
        type = `SoftString<${typeName}>`
      }

      if (field.name === 'parse_mode') {
        type = 'PossibleParseMode'
      }

      // INFO: any [TelegramInputFile] must be replaced with [MediaInput]
      if (type === 'TelegramInputFile | string') {
        type = 'MediaInput'
      }

      // INFO: TelegramInputMedia(*)['media'] should be MediaInput
      if (field.name === 'media' && type === 'string') {
        type = 'MediaInput'
      }

      // INFO: replace [currency]'s [string] with a list of actual currencies
      if (field.name === 'currency') {
        type = 'Currency'
      }

      // INFO: keyboards must have [ReplyMarkupUnion] type
      if (field.name === 'reply_markup' && iface.name !== 'Message') {
        type = 'ReplyMarkupUnion'
      }

      // INFO: additional enums for IDE suggestions...
      // TODO: probably autogenerate some of these from types into enums?

      if (field.name === 'type' && iface.name === 'MessageEntity') {
        type += ' | Enums.MessageEntityType'
      }

      if (field.name === 'status' && iface.name.startsWith('ChatMember')) {
        type += ' | Enums.ChatMemberStatus.' + uppercaseFirst((field as Types.SchemaObjectString).default!)
      }

      if (field.name === 'type' && iface.name === 'Sticker') {
        type += ' | Enums.StickerType'
      }

      if (field.name === 'type' && iface.name.startsWith('BotCommandScope')) {
        type += ' | Enums.BotCommandScopeType.' + uppercaseFirst(undoSnakeCase((field as Types.SchemaObjectString).default!))
      }

      if (field.name === 'message_text') {
        type += ' | Formattable'
      }

      const description = InterfaceService.generateDescription(field.description, 2)
      const property = `${description}\n${tab(field.name)}${field.required ? '' : '?'}: ${type}`

      response.fields.push(property)
    }

    return response
  }
}

class MethodService {
  static async generate (kMethod: Types.SchemaMethod): Promise<ServiceResultMethod> {
    // TODO: simplify

    const mTypeDescription = InterfaceService.generateDescription(kMethod.description, 0, kMethod.documentation_link)
    const mReturnType = TypeResolver.resolve(kMethod.return_type as Types.SchemaObject, 'Interfaces')

    let content = `${mTypeDescription}\nexport type ${kMethod.name} = () => Promise<${mReturnType}>`

    if (kMethod.arguments) {
      const mInterfaceName = uppercaseFirst(kMethod.name) + 'Params'

      const generateFieldsResponse = await MethodService.generateFields(kMethod, 'Interfaces')

      const fields = generateFieldsResponse.fields.map(tab)

      /// just some little hacks over there, nothing special, scroll away
      fields.push('')
      fields.push(tab('[key: string]: any'))

      const mAdditionalTypes = generateFieldsResponse.types.length !== 0 ? generateFieldsResponse.types.map(e => e.content).join('\n') + '\n\n' : ''
      const mInterface = `export interface ${mInterfaceName} {\n${fields.join('\n')}\n}`
      const mParamsNotRequired = kMethod.arguments.every(argument => !argument.required) ? '?' : ''
      const mType = `export type ${kMethod.name} = (params${mParamsNotRequired}: ${mInterfaceName}) => Promise<${mReturnType}>`

      content = `${mAdditionalTypes}${mInterface}\n\n${mTypeDescription}\n${mType}`
    }

    return {
      content,
      name: kMethod.name,
      hasParams: kMethod.arguments !== undefined
    }
  }

  static async generateFields (method: Types.SchemaMethod, addition?: string) {
    const response: GenerateFieldsResponse = {
      fields: [],
      types: []
    }

    // TODO: [field] or [property]?
    for (const field of (method.arguments ?? [])) {
      const description = InterfaceService.generateDescription(field.description, 2)

      let returnType = TypeResolver.resolve(field, addition)

      if (field.type === 'string' && field.enumeration !== undefined) {
        const typeName = uppercaseFirst(method.name) + uppercaseFirst(undoSnakeCase(field.name))

        const type: ServiceResult = {
          name: typeName,
          content: `export type ${typeName} = ${returnType}`
        }

        response.types.push(type)

        returnType = `SoftString<${typeName}>`
      }

      if (field.name === 'parse_mode') {
        returnType = 'Interfaces.PossibleParseMode'
      }

      // INFO: keyboards must have [ReplyMarkupUnion] type
      if (field.name === 'reply_markup') {
        returnType = 'Interfaces.ReplyMarkupUnion'
      }

      // INFO: entities are either [MessageEntity] or [Interfaces.TelegramMessageEntity]
      if (field.name === 'entities' || field.name === 'caption_entities') {
        returnType = '(MessageEntity | Interfaces.TelegramMessageEntity)[]'
      }

      // INFO: [is_anonymous] resolves as [true] because you should either specify [true] or nothing
      // INFO: i don't think that's cool
      if (field.name === 'is_anonymous') {
        returnType = 'boolean'
      }

      // INFO: if return-type is [Interfaces.TelegramInputFile] replace it with [MediaInput]
      if (returnType.includes('Interfaces.TelegramInputFile')) {
        returnType = 'MediaInput'
      }

      // INFO: replace [currency]'s [string] with a list of actual currencies
      if (field.name === 'currency') {
        returnType = 'Interfaces.Currency'
      }

      // INFO: allow passing [Formattable] values to [text] or [caption] params
      if (field.name === 'caption' || (field.name === 'text' && field.required)) {
        returnType += ' | Formattable'
      }

      // INFO: additional enums for IDE suggestions...
      // TODO: probably autogenerate some of these from types into enums?

      if (field.name === 'emoji' && method.name === 'sendDice') {
        returnType += ' | Enums.DiceEmoji'
      }

      if (field.name === 'action' && method.name === 'sendChatAction') {
        returnType += ' | Enums.ChatAction'
      }

      if (field.name === 'sticker_format') {
        returnType += ' | Enums.StickerFormat'
      }

      const property = `${description}\n${tab(field.name)}${field.required ? '' : '?'}: ${returnType}`

      response.fields.push(property)
    }

    return response
  }
}

class TypeService {
  static generate (kType: Types.SchemaInterfaceAnyOf): ServiceResult {
    const name = `Telegram${kType.name}`
    const types = kType.any_of.map(TypeResolver.resolve)

    const description = InterfaceService.generateDescription(kType.description)
    const content = `${description}\nexport type ${name} =\n  | ` + types.join('\n  | ')

    return {
      content,
      name
    }
  }
}

class TypeResolver {
  static resolve (
    object: Types.SchemaObject,
    additionToReference?: string | number // allowing to do [].map(TypeResolver.resolve)
  ): string {
    // TODO: add `addition` check for every SchemaObject

    if (object.type === 'string') {
      if (object.enumeration) {
        return object.enumeration.map(value => `'${value}'`).join(' | ')
      }

      if (object.default) {
        return `'${object.default}'`
      }

      return 'string'
    }

    if (object.type === 'float' || object.type === 'integer') {
      return 'number'
    }

    if (object.type === 'array') {
      const value = TypeResolver.resolve(object.array, additionToReference)

      if (object.array.type === 'any_of') {
        return `(${value})[]`
      }

      return `${value}[]`
    }

    if (object.type === 'bool') {
      if (object.default) {
        return String(object.default)
      }

      return 'boolean'
    }

    if (object.type === 'any_of') {
      const types = object.any_of.map(
        (value) => TypeResolver.resolve(value, additionToReference)
      )

      return types.join(' | ')
    }

    if (object.type === 'reference') {
      const addition = typeof additionToReference === 'string' // allowing to do [].map(TypeResolver.resolve)
        ? `${additionToReference}.`
        : ''

      const internalCheck = object.is_internal
        ? ''
        : 'Telegram'

      return addition + internalCheck + object.reference
    }

    throw new Error(`unresolved type: ${object}`)
  }
}

class SchemaService {
  static isType (schema: Types.SchemaInterface): schema is Types.SchemaInterfaceAnyOf {
    return schema.type === 'any_of'
  }
}

class GenerationService {
  static loadString (header: string) {
    return header + '\n\n'
  }

  static generate (results: ServiceResult[], header?: string) {
    let content = header
      ? GenerationService.loadString(header)
      : ''

    for (const element of results) {
      content += GenerationService.loadString(element.content)
    }

    return content.trimEnd()
  }

  static generateInterfacesImports () {
    return stripIndent`
      import { Readable } from 'stream' // INFO: for Interfaces.InputFile

      import * as Enums from '../types/enums'

      import { SoftString, Formattable } from '../types/types'

      import { MediaInput } from '../common/media-source'

      import {
        Keyboard,
        KeyboardBuilder,
        InlineKeyboardBuilder,
        InlineKeyboard,
        ForceReply,
        RemoveKeyboard
      } from '../common/keyboards'
    `
  }

  static generateMethodsImports () {
    return stripIndent`
      import * as Interfaces from './telegram-interfaces'

      import * as Enums from '../types/enums'

      import { SoftString, Formattable } from '../types/types'

      import { MediaInput } from '../common/media-source'
      import { MessageEntity } from '../common/structures'
    `
  }

  static generateAdditionalTypes () {
    return stripIndent`
      export type InputFile = string | Record<string, any> | Buffer | Readable
      export type PossibleParseMode = SoftString<'HTML' | 'Markdown' | 'MarkdownV2'> | Enums.ParseMode
      export type ReplyMarkupUnion =
        | TelegramInlineKeyboardMarkup | TelegramReplyKeyboardMarkup | TelegramReplyKeyboardRemove | TelegramForceReply
        | Keyboard | KeyboardBuilder | InlineKeyboard | InlineKeyboardBuilder | ForceReply | RemoveKeyboard
    `
  }

  static generateCurrenciesType (currencies: Types.CurrenciesResponse) {
    const enumeration = buildEnumeration(currencies)

    return `export type Currency = SoftString<${(enumeration.enumeration ?? []).map(e => `'${e}'`).join(' | ')}>`
  }

  static generateApiMethods (methods: Types.SchemaMethod[]) {
    const fields = methods.map(
      (method) => {
        const description = InterfaceService.generateDescription(method.description, 2, method.documentation_link)

        return `${description}\n${tab(method.name)}: api.${method.name}`
      }
    ).map(tab)

    const content = `import * as api from './methods'\n\nexport interface ApiMethods {\n${fields.join('\n')}\n\n  [key: string]: (...args: any[]) => Promise<any>\n}`

    return content
  }
}

///           GENERATION           ///

export interface InterfacesData {
  interfaces: ServiceResultInterface[]
  types: ServiceResult[]
  methods: ServiceResultMethod[]
}

export type GenerateDataType = InterfacesData & { time: number }

export const pad = (number: number) => String(number).padStart(2, '0')
export const tab = (source: string) => `  ${source}`

export const fetchCurrencies = async () => {
  const response = await fetch(CURRENCIES_URL)
  const json = await response.json() as Types.CurrenciesResponse

  return json
}

let currencies: Types.CurrenciesResponse | undefined

const loadCurrencies = () => (currencies ?? fetchCurrencies())

const buildEnumeration = (currencies: Types.CurrenciesResponse): Types.SchemaObjectString => {
  return {
    type: 'string',
    name: 'currency',
    required: true,
    description: 'Three-letter ISO 4217 currency code',
    enumeration: Object.keys(currencies)
  }
}

export async function getJson (fromFile = false) {
  let json: Types.SchemaResponse

  if (fromFile) {
    const response = (await readFile(SCHEMA_URL)).toString()
    json = JSON.parse(response)
  } else {
    const response = await fetch(SCHEMA_URL)
    json = await response.json() as Types.SchemaResponse
  }

  return json
}

export async function generate () {
  const { objects: interfaces, methods } = await getJson()

  const _generation_start = Date.now()

  const items: InterfacesData = {
    interfaces: [],
    types: [],
    methods: []
  }

  for (const kInterface of interfaces) {
    if (SchemaService.isType(kInterface)) {
      const result = TypeService.generate(kInterface)

      items.types.push(result)

      continue
    }

    const result = await InterfaceService.generate(kInterface)

    items.interfaces.push(result)
  }

  for (const kMethod of methods) {
    const result = await MethodService.generate(kMethod)

    items.methods.push(result)
  }

  const _generation_end = Date.now()

  const data: GenerateDataType = {
    ...items,
    time: _generation_end - _generation_start
  }

  return data
}

export function generateHeader (version: Types.SchemaVersion, recentChanges: Types.SchemaRecentChanges) {
  const date = new Date()

  const apiVersion = `v${version.major}.${version.minor}.${version.patch}`
  const apiUpdateDate = `${pad(recentChanges.day)}.${pad(recentChanges.month)}.${recentChanges.year}`
  const generationDate = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} MSK`

  const header = stripIndents`
    /// AUTO-GENERATED FILE
    /// DO NOT EDIT MANUALLY
    ///
    /// This file was auto-generated using https://github.com/ark0f/tg-bot-api
    /// Based on Bot API ${apiVersion}, ${apiUpdateDate}
    /// Generation date: ${generationDate}
  `

  return header
}

async function _generate (generateFiles = true) {
  const { version, recent_changes, methods } = await getJson()

  const _generation_start = Date.now()

  const items = await generate()
  const header = generateHeader(version, recent_changes)

  console.log('[header]')
  console.log(header)
  console.log()

  /// INTERFACES ----------

  console.log(`[interfaces (${items.interfaces.length})]`)

  for (const kInterface of items.interfaces) {
    console.log(`- ${kInterface.name} (${kInterface.fields} fields)`)
  }

  console.log()

  /// TYPES ----------

  console.log(`[types (${items.types.length})]`)

  for (const kType of items.types) {
    console.log(`- ${kType.name}`)
  }

  console.log()

  /// METHODS ----------

  console.log(`[methods (${items.methods.length})]`)

  for (const kMethod of items.methods) {
    console.log(`- ${kMethod.name}(${kMethod.hasParams ? 'params' : ''})`)
  }

  console.log()

  console.log('[results]')

  /// FILES GENERATION ----------

  if (generateFiles) {
    const mainPath = resolve(__dirname, '..', '..', 'packages', 'puregram', 'src', 'generated')

    const currencies = await loadCurrencies()

    /// telegram-interfaces.ts
    const iHeader = GenerationService.loadString(header) +
      GenerationService.generateInterfacesImports()

    let iContent = GenerationService.loadString(
      GenerationService.generate(items.interfaces, iHeader)
    )

    iContent += GenerationService.loadString(
      GenerationService.generateAdditionalTypes()
    )

    iContent += GenerationService.loadString(
      GenerationService.generateCurrenciesType(currencies)
    )

    iContent += GenerationService.generate(items.types)

    await writeFile(`${mainPath}/telegram-interfaces.ts`, iContent)

    console.log(`- telegram-interfaces.ts: ${items.interfaces.length} interfaces, ${items.types.length} types, ${iContent.split('\n').length} lines`)

    /// methods.ts
    const mHeader = GenerationService.loadString(header) +
      GenerationService.generateMethodsImports()

    const mContent = GenerationService.generate(items.methods, mHeader)

    await writeFile(`${mainPath}/methods.ts`, mContent)

    console.log(`- methods.ts: ${items.methods.length} methods, ${mContent.split('\n').length} lines`)

    /// api-methods.ts
    let amContent = GenerationService.generate([], header)
    amContent += '\n\n' + GenerationService.generateApiMethods(methods)

    await writeFile(`${mainPath}/api-methods.ts`, amContent)

    console.log(`- api-methods.ts: ${amContent.split('\n').length} lines`)
  }

  const _generation_end = Date.now()

  console.log(`time: ${_generation_end - _generation_start}ms`)
  console.log(`generation time: ${items.time}ms`)

  return 0
}

_generate().catch(console.error)
