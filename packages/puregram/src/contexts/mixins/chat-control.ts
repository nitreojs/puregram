import * as Methods from '../../generated/methods'
import * as Interfaces from '../../generated/telegram-interfaces'

import { MediaInput } from '../../common/media-source'

import { Optional } from '../../types/types'

import { Context } from '../context'
import { NodeMixin } from './node'
import { TargetMixin } from './target'

/** This object represents a mixin that is responsible for all the chat management methods */
class ChatControlMixin {
  /** Sets a custom title */
  setCustomTitle (title: string, params?: Optional<Methods.SetChatAdministratorCustomTitleParams, 'chat_id' | 'user_id'>) {
    return this.telegram.api.setChatAdministratorCustomTitle({
      chat_id: this.chatId,
      user_id: this.senderId!,
      custom_title: title,
      ...params
    })
  }

  /** Sets default chat permissions */
  setChatDefaultPermissions (permissions: Interfaces.TelegramChatPermissions, params?: Optional<Methods.SetChatPermissionsParams, 'chat_id' | 'permissions'>) {
    return this.telegram.api.setChatPermissions({
      chat_id: this.chatId,
      permissions,
      ...params
    })
  }

  /** Sets a new profile photo for the chat */
  setChatPhoto (photo: MediaInput, params?: Optional<Methods.SetChatPhotoParams, 'chat_id' | 'photo'>) {
    return this.telegram.api.setChatPhoto({
      chat_id: this.chatId,
      photo,
      ...params
    })
  }

  /** Deletes a chat photo */
  // INFO: had to rename it from `deleteChatPhoto` because of `TelegramMessage.delete_chat_photo` 😤😤
  removeChatPhoto (params?: Optional<Methods.DeleteChatPhotoParams, 'chat_id'>) {
    return this.telegram.api.deleteChatPhoto({
      chat_id: this.chatId,
      ...params
    })
  }

  /** Changes chat title */
  setChatTitle (title: string, params?: Optional<Methods.SetChatTitleParams, 'chat_id' | 'title'>) {
    return this.telegram.api.setChatTitle({
      chat_id: this.chatId,
      title,
      ...params
    })
  }

  /** Changes chat description */
  setChatDescription (description: string, params?: Optional<Methods.SetChatDescriptionParams, 'chat_id' | 'description'>) {
    return this.telegram.api.setChatDescription({
      chat_id: this.chatId,
      description,
      ...params
    })
  }

  /** Sets new group stickerset */
  setChatStickerSet (name: string, params?: Optional<Methods.SetChatStickerSetParams, 'chat_id' | 'sticker_set_name'>) {
    return this.telegram.api.setChatStickerSet({
      chat_id: this.chatId,
      sticker_set_name: name,
      ...params
    })
  }

  /** Deletes group stickerset */
  deleteChatStickerSet (params?: Optional<Methods.DeleteChatStickerSetParams, 'chat_id'>) {
    return this.telegram.api.deleteChatStickerSet({
      chat_id: this.chatId,
      ...params
    })
  }
}

interface ChatControlMixin extends Context, TargetMixin, NodeMixin { }

export { ChatControlMixin }
