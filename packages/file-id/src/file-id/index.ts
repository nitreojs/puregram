export { FileId } from './class'
export {
  isDocumentFileId,
  isPhotoFileId,
  isStickerFileId,
  isWebFileId
} from './guards'
export { parseFileId } from './parse'
export { serializeFileId } from './serialize'
export type { DocumentFileId, ParsedFileId, PhotoFileId, WebFileId } from './types'
