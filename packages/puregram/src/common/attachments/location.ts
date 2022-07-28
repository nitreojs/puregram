import * as Interfaces from '../../generated/telegram-interfaces'

import { AttachmentType } from '../../types/types'
import { applyMixins } from '../../utils/helpers'

import { Location } from '../structures/location'

import { Attachment } from './attachment'

class LocationAttachment extends Location {
  attachmentType: AttachmentType = 'location'

  toJSON (): Interfaces.TelegramLocation {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
      heading: this.heading,
      horizontal_accuracy: this.horizontalAccuracy,
      live_period: this.livePeriod,
      proximity_alert_radius: this.proximityAlertRadius
    }
  }
}

interface LocationAttachment extends Attachment { }
applyMixins(LocationAttachment, [Attachment])

export { LocationAttachment }
