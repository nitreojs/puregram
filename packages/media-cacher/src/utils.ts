import { MediaInput, MediaSourceType } from 'puregram'

/** Totally safe way to identify whether `obj` is `MediaInput` or not */
// definitely not stolen from puregram
export const isMediaInput = (obj: Record<string, any>): obj is MediaInput => (
  obj.type !== undefined && Object.values(MediaSourceType).includes(obj.type)
)
