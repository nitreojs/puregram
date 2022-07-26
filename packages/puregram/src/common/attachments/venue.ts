import * as Interfaces from '../../generated/telegram-interfaces'

import { AttachmentType } from '../../types/types'
import { applyMixins } from '../../utils/helpers'

import { Venue } from '../structures'

import { Attachment } from './attachment'

class VenueAttachment extends Venue {
  attachmentType: AttachmentType = 'venue'

  toJSON (): Interfaces.TelegramVenue {
    return {
      location: this.location.toJSON(),
      title: this.title,
      address: this.address,
      foursquare_id: this.foursquareId,
      foursquare_type: this.foursquareType,
      google_place_id: this.googlePlaceId,
      google_place_type: this.googlePlaceType
    }
  }
}

interface VenueAttachment extends Attachment { }
applyMixins(VenueAttachment, [Attachment])

export { VenueAttachment }
