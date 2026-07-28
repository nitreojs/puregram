// file_id type ids — mirror TDLib FileType enum
export enum FileType {
  Thumbnail = 0,
  ProfilePhoto = 1,
  Photo = 2,
  VoiceNote = 3,
  Video = 4,
  Document = 5,
  Encrypted = 6,
  Temp = 7,
  Sticker = 8,
  Audio = 9,
  Animation = 10,
  EncryptedThumbnail = 11,
  Wallpaper = 12,
  VideoNote = 13,
  SecureDecrypted = 14,
  SecureEncrypted = 15,
  Background = 16,
  DocumentAsFile = 17,
  Ringtone = 18,
  CallLog = 19,
  PhotoStory = 20,
  VideoStory = 21,
  SelfDestructingPhoto = 22,
  SelfDestructingVideo = 23,
  SelfDestructingVideoNote = 24,
  SelfDestructingVoiceNote = 25,
  LivePhoto = 26,
  SelfDestructingLivePhoto = 27,
  // sentinel one past the last real type — TDLib's MAX_FILE_TYPE
  Size = 28,
  None = 29
}

// TDLib's FileTypeClass::Photo — these file_ids carry a trailing PhotoSizeSource
// instead of the plain { id, access_hash } document body
export type PhotoFileType =
  | FileType.Thumbnail
  | FileType.ProfilePhoto
  | FileType.Photo
  | FileType.EncryptedThumbnail
  | FileType.Wallpaper
  | FileType.PhotoStory
  | FileType.SelfDestructingPhoto

const PHOTO_FILE_TYPES: ReadonlySet<FileType> = new Set([
  FileType.Thumbnail,
  FileType.ProfilePhoto,
  FileType.Photo,
  FileType.EncryptedThumbnail,
  FileType.Wallpaper,
  FileType.PhotoStory,
  FileType.SelfDestructingPhoto
])

/** whether a file type is a photo location — i.e. its `file_id` carries a `PhotoSizeSource` */
export function isPhotoFileType (fileType: FileType): fileType is PhotoFileType {
  return PHOTO_FILE_TYPES.has(fileType)
}

// type_id flags packed into the high bits of the first i32
export const WEB_LOCATION_FLAG = 0x01000000
export const FILE_REFERENCE_FLAG = 0x02000000

// file_unique_id type ids — small, separate enum
export enum FileUniqueType {
  Web = 0,
  Photo = 1,
  Document = 2,
  Secure = 3,
  Encrypted = 4,
  Temp = 5
}

// PhotoSizeSource variant tags — mirror TDLib PhotoSizeSource::Type
export enum PhotoSizeSourceType {
  Legacy = 0,
  Thumbnail = 1,
  DialogPhotoSmall = 2,
  DialogPhotoBig = 3,
  StickerSetThumbnail = 4,
  FullLegacy = 5,
  DialogPhotoSmallLegacy = 6,
  DialogPhotoBigLegacy = 7,
  StickerSetThumbnailLegacy = 8,
  StickerSetThumbnailVersion = 9
}

// TDLib Version cutoffs that affect the photo file_id binary layout
// see td/td/telegram/Version.h enum class Version
export const VERSION_ADD_PHOTO_SIZE_SOURCE = 22
export const VERSION_REMOVE_PHOTO_VOLUME_AND_LOCAL_ID = 32

// major versions the parser accepts. 3 is TDLib's "generated" local-file id and never appears
// as a remote file_id, so it's absent on purpose. sub_version is deliberately unbounded — TDLib
// writes `Version::Next - 1` there, so it climbs on every telegram release, while the only
// layout cutoffs that matter are the two above
export const SUPPORTED_VERSIONS: readonly number[] = [2, 4]

// mapping from full FileType to FileUniqueType — used by fileUniqueIdFromFileId
export const FILE_TYPE_TO_UNIQUE: ReadonlyMap<FileType, FileUniqueType> = new Map([
  [FileType.Thumbnail, FileUniqueType.Photo],
  [FileType.ProfilePhoto, FileUniqueType.Photo],
  [FileType.Photo, FileUniqueType.Photo],
  [FileType.EncryptedThumbnail, FileUniqueType.Photo],
  [FileType.Wallpaper, FileUniqueType.Photo],
  [FileType.PhotoStory, FileUniqueType.Photo],
  [FileType.SelfDestructingPhoto, FileUniqueType.Photo],

  [FileType.VoiceNote, FileUniqueType.Document],
  [FileType.Video, FileUniqueType.Document],
  [FileType.Document, FileUniqueType.Document],
  [FileType.Sticker, FileUniqueType.Document],
  [FileType.Audio, FileUniqueType.Document],
  [FileType.Animation, FileUniqueType.Document],
  [FileType.VideoNote, FileUniqueType.Document],
  [FileType.Background, FileUniqueType.Document],
  [FileType.DocumentAsFile, FileUniqueType.Document],
  [FileType.Ringtone, FileUniqueType.Document],
  [FileType.CallLog, FileUniqueType.Document],
  [FileType.VideoStory, FileUniqueType.Document],
  [FileType.SelfDestructingVideo, FileUniqueType.Document],
  [FileType.SelfDestructingVideoNote, FileUniqueType.Document],
  [FileType.SelfDestructingVoiceNote, FileUniqueType.Document],
  [FileType.LivePhoto, FileUniqueType.Document],
  [FileType.SelfDestructingLivePhoto, FileUniqueType.Document],

  [FileType.SecureDecrypted, FileUniqueType.Secure],
  [FileType.SecureEncrypted, FileUniqueType.Secure],

  [FileType.Encrypted, FileUniqueType.Encrypted],

  [FileType.Temp, FileUniqueType.Temp]
])
