import { MessageEntity } from 'puregram'

// TODO:               implements Formattable
export class Formatted {
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
