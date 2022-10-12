import * as Interfaces from '../../generated/telegram-interfaces'

import { AttachmentType } from '../../types/types'
import { applyMixins } from '../../utils/helpers'

import { Poll } from '../structures'

import { Attachment } from './attachment'

class PollAttachment extends Poll {
  attachmentType: AttachmentType = 'poll'

  toJSON (): Interfaces.TelegramPoll {
    return {
      id: this.id,
      question: this.question,
      options: this.options.map(option => option.toJSON()),
      total_voter_count: this.totalVoterCount,
      is_closed: this.isClosed(),
      is_anonymous: this.isAnonymous(),
      type: this.type,
      allows_multiple_answers: this.allowsMultipleAnswers,
      correct_option_id: this.correctOptionId,
      explanation: this.explanation,
      explanation_entities: this.explanationEntities?.map(entity => entity.toJSON()),
      open_period: this.openPeriod,
      close_date: this.closeDate
    }
  }
}

interface PollAttachment extends Attachment { }
applyMixins(PollAttachment, [Attachment])

export { PollAttachment }
