import { inspectable } from 'inspectable'

import * as Contexts from '../contexts'

interface MediaGroupOptions {
  id: string
  contexts: Contexts.MessageContext[]
}

/** This object represent a media group: a group of contexts with some attachments in it */
export class MediaGroup {
  constructor(private options: MediaGroupOptions) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  get id() {
    return this.options.id
  }

  get contexts() {
    if (this.options.contexts[0].mediaGroup !== undefined) {
      delete this.options.contexts[0].mediaGroup
    }

    return this.options.contexts
  }

  get attachments() {
    const attachments = this.contexts.map(context => context.attachments).flat()

    return attachments
  }
}

inspectable(MediaGroup, {
  serialize(mg) {
    return {
      id: mg.id,
      contexts: mg.contexts,
      attachments: mg.attachments
    }
  }
})
