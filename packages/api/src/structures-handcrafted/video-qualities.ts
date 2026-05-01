import type { InspectOptionsStylized } from 'node:util'

import { INSPECT, makeInspect } from '../generated/inspect'
import { VideoQuality } from '../generated/structures'
import type { TelegramVideoQuality } from '../generated/types'

type InspectFn = (value: unknown, options: InspectOptionsStylized) => string

/**
 * a video at multiple qualities
 *
 * wraps the `VideoQuality[]` payload as a single ergonomic object exposing the largest /
 * smallest / minimum-width / by-codec quality. iterating yields `VideoQuality` wrappers
 * in payload order
 */
export class VideoQualities {
  raw: TelegramVideoQuality[]
  // memo-cache convention shared with codegen'd structures
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private _qualities?: VideoQuality[]

  constructor (raw: TelegramVideoQuality[]) {
    this.raw = raw
  }

  /** lazily-wrapped `VideoQuality` instances for every available quality */
  get qualities () {
    this._qualities ??= this.raw.map(x => new VideoQuality(x))

    return this._qualities
  }

  /** number of available qualities */
  get length () {
    return this.raw.length
  }

  /** largest quality by file_size, falling back to width × height */
  get biggest () {
    return this.qualities.reduce((acc, cur) => (sizeKey(cur.raw) > sizeKey(acc.raw) ? cur : acc))
  }

  /** smallest quality by file_size, falling back to width × height */
  get smallest () {
    return this.qualities.reduce((acc, cur) => (sizeKey(cur.raw) < sizeKey(acc.raw) ? cur : acc))
  }

  /** wrap a raw `VideoQuality[]` payload in a `VideoQualities` */
  static fromPayload (raw: TelegramVideoQuality[]) {
    return new VideoQualities(raw)
  }

  /** smallest quality with width ≥ minWidth, falling back to `biggest` if none qualify */
  byMin (minWidth: number) {
    let match: VideoQuality | undefined

    for (const quality of this.qualities) {
      if (quality.width < minWidth) {
        continue
      }

      if (match === undefined || quality.width < match.width) {
        match = quality
      }
    }

    return match ?? this.biggest
  }

  /** quality with the given codec (e.g. 'h264', 'h265', 'av01'), or undefined */
  byCodec (codec: string) {
    return this.qualities.find(q => q.codec === codec)
  }

  [Symbol.iterator] () {
    return this.qualities[Symbol.iterator]()
  }

  [INSPECT] (depth: number, options: InspectOptionsStylized, inspect: InspectFn) {
    return makeInspect('VideoQualities', this, depth, options, inspect)
  }
}

function sizeKey (raw: TelegramVideoQuality) {
  return raw.file_size ?? raw.width * raw.height
}
