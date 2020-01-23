import { ITelegramParams, ISendMessageParams } from '../../typings/params';
import { ChatTypes, AttachmentTypes } from '../../typings/types';

import Context from './context';
import ReplyMessageContext from './reply-message';

import User from '../structures/user';
import Chat from '../structures/chat';
import Audio from '../structures/audio';
import Document from '../structures/document';
import Animation from '../structures/animation';
import Game from '../structures/game';
import MessageEntity from '../structures/message-entity';
import PhotoSize from '../structures/photo-size';
import Sticker from '../structures/sticker';
import Video from '../structures/video';
import Voice from '../structures/voice';
import VideoNote from '../structures/video-note';
import Contact from '../structures/contact';
import Location from '../structures/location';
import Venue from '../structures/venue';
import Poll from '../structures/poll';
import Invoice from '../structures/invoice';
import SuccessfulPayment from '../structures/successful-payment';

type Attachment =
  | Audio | Document | Animation
  | Game | PhotoSize | Sticker
  | Video | Voice | VideoNote
  | Contact | Location | Venue
  | Poll;

declare class MessageContext extends Context {
  public constructor(telegram: ITelegramParams, update: object);

  public id: number;

  public from: User;

  public senderId: number;

  public isOutbox: boolean;

  public date: number;

  public chat: Chat;

  public chatId: number;

  public chatType: ChatTypes;

  public forwardFrom?: User;

  public forwardFromChat?: User;

  public forwardFromMessageId?: number;

  public forwardSignature?: string;

  public forwardSenderName?: string;

  public forwardDate?: number;

  public isForward: boolean;

  public replyMessage?: ReplyMessageContext;

  public editDate?: number;

  public mediaGroupId?: string;

  public authorSignature?: string;

  public text?: string;

  public entities?: Array<MessageEntity>;

  public hasEntities: boolean;

  public captionEntities?: Array<MessageEntity>;

  public audio?: Audio;

  public document?: Document;

  public animation?: Animation;

  public game?: Game;

  public audio?: Audio;

  public photo?: Array<PhotoSize>;

  public sticker?: Sticker;

  public video?: Video;

  public voice?: Voice;

  public videoNote?: VideoNote;

  public caption?: string;

  public contact?: Contact;

  public location?: Location;

  public venue?: Venue;

  public poll?: Poll;

  public attachments: Array<Attachment>;

  public hasAttachments(type?: AttachmentTypes): boolean;

  public getAttachments(type?: AttachmentTypes): boolean;

  public newChatMembers?: Array<User>;

  public leftChatMember?: User;

  public newChatTitle?: string;

  public newChatPhoto?: Array<PhotoSize>;

  public deleteChatPhoto?: true;

  public groupChatCreated?: true;

  public supergroupChatCreated?: true;

  public channelChatCreated?: true;

  public migrateToChatId?: number;

  public migrateFromChatId?: number;

  public pinnedMessage?: MessageContext;

  public invoice?: Invoice;

  public successfulPayment?: SuccessfulPayment;

  public connectedWebsite?: string;

  public passportData?: PassportData;

  public replyMarkup?: InlineKeyboardMarkup;

  public isEvent: boolean;

  public eventType?: string;

  public hasText: boolean;

  public hasForward: boolean;

  public isPM: boolean;

  public send(text: string, params: ISendMessageParams): Promise<MessageContext>;

  public reply(text: string, params: ISendMessageParams): Promise<MessageContext>;

  public sendPhoto(text: string, params: ISendMessageParams): Promise<MessageContext>;
}

export = MessageContext;
