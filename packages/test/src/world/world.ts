import type { BotIdentity } from '../actors/identity'
import { defaultBotIdentity } from '../actors/identity'

export class World {
  bot: BotIdentity = defaultBotIdentity()
  updateIdCounter = 0

  nextUpdateId () {
    this.updateIdCounter += 1

    return this.updateIdCounter
  }
}
