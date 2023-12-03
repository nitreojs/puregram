import { MessageEntity } from 'puregram'
import { Formattable } from 'puregram/types'

export class Formatted implements Formattable {
  constructor (public text = '', public entities: MessageEntity[] = []) { }

  addText (text: string) {
    this.text += text
  }

  addEntity (entity: MessageEntity) {
    this.entities.push(entity)
  }

  addEntities (entities: MessageEntity[]) {
    this.entities.push(...entities)
  }

  format () {
    return this.text
  }
}
