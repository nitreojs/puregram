import { inspectable } from 'inspectable'

import * as Contexts from '../contexts'

interface MediaGroupOptions {
  id: string
  contexts: Contexts.MessageContext[]
}

/** This object represent a media group: a group of contexts with some attachments in it */
export class MediaGroup {
  constructor (private options: MediaGroupOptions) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Returns media group's ID */
  get id () {
    return this.options.id
  }

  /** Returns a list of contexts (constructed earlier) every single of which contains an attachment */
  get contexts () {
    return this.options.contexts
  }

  /** Returns a list of attachments (mapped through `contexts`) */
  get attachments () {
    const attachments = this.contexts.map(context => context.attachments).flat()

    return attachments
  }
}

inspectable(MediaGroup, {
  serialize (mg) {
    return {
      id: mg.id,
      contexts: mg.contexts,
      attachments: mg.attachments
    }
  }
})
