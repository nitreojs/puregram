import type { TestChat } from '../actors/chat'
import type { BotIdentity } from '../actors/identity'
import { defaultBotIdentity } from '../actors/identity'
import type { TestUser } from '../actors/user'

export class World {
  bot: BotIdentity = defaultBotIdentity()
  updateIdCounter = 0
  readonly users: TestUser[] = []
  readonly chats: TestChat[] = []

  nextUpdateId () {
    this.updateIdCounter += 1

    return this.updateIdCounter
  }
}
