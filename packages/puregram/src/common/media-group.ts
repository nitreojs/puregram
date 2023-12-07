import { Inspect, Inspectable } from 'inspectable'

import * as Contexts from '../contexts'

interface MediaGroupOptions {
  id: string
  contexts: Contexts.MessageContext[]
}

/** This object represents a media group: a group of contexts with some attachments in it */
@Inspectable()
export class MediaGroup {
  constructor (private options: MediaGroupOptions) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Returns media group's ID */
  @Inspect()
  get id () {
    return this.options.id
  }

  /** Returns a list of contexts (constructed earlier) every single of which contains an attachment */
  @Inspect()
  get contexts () {
    return this.options.contexts
  }

  /** Returns a list of attachments (mapped through `contexts`) */
  @Inspect()
  get attachments () {
    const attachments = this.contexts.map(context => context.attachment)

    return attachments
  }
}
