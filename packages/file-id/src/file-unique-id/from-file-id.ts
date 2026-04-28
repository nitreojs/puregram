import { FILE_TYPE_TO_UNIQUE, FileUniqueType } from '../constants'
import { FileIdParseError } from '../errors'
import type { ParsedFileId } from '../file-id/types'

export function fileUniqueIdFromFileId (file: ParsedFileId) {
  if (file.kind === 'web') {
    return { kind: 'web', source: '', url: file.url }
  }

  const unique = FILE_TYPE_TO_UNIQUE.get(file.fileType)

  if (unique === undefined) {
    throw new FileIdParseError(`no unique_id mapping for file type ${file.fileType}`)
  }

  switch (unique) {
    case FileUniqueType.Photo:
      if (file.kind !== 'photo') {
        throw new FileIdParseError('expected photo file_id for photo unique_id')
      }

      return {
        kind: 'photo',
        source: '',
        volumeId: file.photoSize.volumeId,
        localId: file.photoSize.localId
      }

    case FileUniqueType.Document:
      return { kind: 'document', source: '', id: file.id }

    case FileUniqueType.Secure:
      return { kind: 'secure', source: '', id: file.id }

    case FileUniqueType.Encrypted:
      return { kind: 'encrypted', source: '', id: file.id }

    case FileUniqueType.Temp:
      return { kind: 'temp', source: '', id: file.id }

    case FileUniqueType.Web:
      throw new FileIdParseError('FileUniqueType.Web should be handled by the kind === "web" branch')
  }
}
