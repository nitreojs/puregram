import { type Entity, Formatted } from '../formatted'

/** named-flag form for the telegram date_time format string `r|w?[dD]?[tT]?` */
export interface TimeFormat {
  /** displays the time relative to the current time. cannot combine with any other flag */
  relative?: boolean
  /** displays the day of the week in the user's localized language */
  weekday?: boolean
  /** displays the date in short (`'short'`, e.g. "17.03.22") or long (`'long'`, e.g. "March 17, 2022") form */
  dateStyle?: 'short' | 'long'
  /** displays the time in short (`'short'`, e.g. "22:45") or long (`'long'`, e.g. "22:45:00") form */
  timeStyle?: 'short' | 'long'
}

/** composes a {@link TimeFormat} into the wire format string. throws on invalid combinations */
export function composeTimeFormat (opts: TimeFormat) {
  if (opts.relative === true) {
    if (opts.weekday === true || opts.dateStyle !== undefined || opts.timeStyle !== undefined) {
      throw new RangeError('time: `relative` cannot combine with weekday/dateStyle/timeStyle')
    }

    return 'r'
  }

  let out = ''

  if (opts.weekday === true) {
    out += 'w'
  }

  if (opts.dateStyle === 'short') {
    out += 'd'
  } else if (opts.dateStyle === 'long') {
    out += 'D'
  }

  if (opts.timeStyle === 'short') {
    out += 't'
  } else if (opts.timeStyle === 'long') {
    out += 'T'
  }

  return out
}

/** wraps text in a `date_time` entity. accepts a unix timestamp (seconds) or a `Date` */
export function time (text: string, when: number | Date, format?: TimeFormat) {
  const unix = when instanceof Date ? Math.floor(when.getTime() / 1000) : when
  const entity: Entity = { type: 'date_time', offset: 0, length: text.length, unix_time: unix }

  if (format !== undefined) {
    const composed = composeTimeFormat(format)

    if (composed !== '') {
      entity.date_time_format = composed
    }
  }

  return new Formatted(text, [entity])
}
