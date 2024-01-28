import type { Known, MaybeArray } from '../types/types'

import * as Interfaces from '../generated/telegram-interfaces'

import { MessageEntity } from './structures'

/**
 * This class wraps basic array of `MessageEntity` and provides some methods
 * such as `has(type)` or `atOffset(index)` for easier workflow with entities
 *
 * @example
 * if (!context.entities.has(['bold', 'italic'])) {
 *   return context.reply('no bold/italic markdown found!')
 * }
 *
 * @example
 * const entities = context.entities.only('pre').with({ language: 'js' })
 * // can also be   context.entities.with({ type: 'pre', language: 'js' })
 *
 * if (entities.isEmpty()) {
 *   return context.send('no ```js tags found!')
 * }
 */
export class MessageEntities extends Array<MessageEntity> {
  constructor (...entities: MessageEntity[]) {
    super(...entities)
  }

  isEmpty () {
    return this.length === 0
  }

  get first () {
    return this.at(0)
  }

  get last () {
    return this.at(-1)
  }

  has (type: MessageEntity['type']) {
    return this.some(e => e.type === type)
  }

  only (type: MaybeArray<MessageEntity['type']>) {
    const types = Array.isArray(type) ? type : [type]

    return this.filter(e => types.includes(e.type)) as MessageEntities
  }

  with (payload: Partial<Known<Interfaces.TelegramMessageEntity>>) {
    const entries = Object.entries(payload)

    return this.filter(
      (entity) => entries.every(([key, value]) => key in entity.payload && (Array.isArray(value) ? value.includes(entity.payload[key]) : entity.payload[key] === value))
    ) as MessageEntities
  }

  except (type: MaybeArray<MessageEntity['type']>) {
    const types = Array.isArray(type) ? type : [type]

    return this.filter(e => !types.includes(e.type)) as MessageEntities
  }

  without (payload: Partial<Known<Interfaces.TelegramMessageEntity>>) {
    const entries = Object.entries(payload)

    return this.filter(
      (entity) => entries.every(([key, value]) => !(key in entity.payload) || entity.payload[key] !== value)
    ) as MessageEntities
  }

  atOffset (index: number) {
    return this.filter(e => e.offset === index) as MessageEntities
  }

  toJSON () {
    return Array.from(this.map(e => e.toJSON()))
  }
}
