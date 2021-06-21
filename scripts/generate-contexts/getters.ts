import { stripIndent } from 'common-tags';

import * as Types from './types';

export const ID_GETTERS: Types.Getter[] = [
  {
    name: 'senderId',
    description: 'Sender ID',
    returnType: 'number | undefined',
    code: `return this.from?.id;`
  },

  {
    name: 'chatId',
    description: 'Chat ID',
    returnType: 'number | undefined',
    code: `return this.chat?.id;`
  }
];

export const CHAT_TYPE_GETTERS: Types.Getter[] = [
  {
    name: 'isPM',
    description: '`true` if this chat\'s type is `private`',
    returnType: 'boolean',
    code: `return this.chatType === \'private\';`
  },

  {
    name: 'isGroup',
    description: '`true` if this chat\'s type is `group`',
    returnType: 'boolean',
    code: `return this.chatType === 'group';`
  },

  {
    name: 'isSupergroup',
    description: '`true` if this chat\'s type is `supergroup`',
    returnType: 'boolean',
    code: `return this.chatType === 'supergroup';`
  },

  {
    name: 'isChannel',
    description: '`true` if this chat\'s type is `channel`',
    returnType: 'boolean',
    code: `return this.chatType === 'channel';`
  }
];

export const HAS_GETTERS: Types.Getter[] = [
  {
    name: 'hasText',
    description: '`true` if property `text` is not empty',
    isFunctionGetter: true,
    returnType: 'boolean',
    code: `return this.text !== undefined;`
  },

  {
    name: 'hasAuthorSignature',
    description: '`true` if property `authorSignature` is not empty',
    isFunctionGetter: true,
    returnType: 'boolean',
    code: `return this.authorSignature !== undefined;`
  },

  {
    name: 'hasCaption',
    description: '`true` if property `caption` is not empty',
    isFunctionGetter: true,
    returnType: 'boolean',
    code: `return this.caption !== undefined;`
  },

  {
    name: 'hasEntities',
    description: '`true` if property `entities` is not empty (and has specified type)',
    isFunctionGetter: true,
    arguments: [`type?: EntityType | Interfaces.MessageEntity['type']`],
    returnType: 'boolean',
    code: stripIndent`
      if (type === undefined) return this.entities.length !== 0;

      return this.entities.some(
        (entity: MessageEntity) => entity.type === type
      );
    `
  },

  {
    name: 'hasCaptionEntities',
    description: '`true` if property `captionEntities` is not empty (and has specified type)',
    isFunctionGetter: true,
    arguments: [`type?: EntityType | Interfaces.MessageEntity['type']`],
    returnType: 'boolean',
    code: stripIndent`
      if (type === undefined) return this.captionEntities.length !== 0;

      return this.captionEntities.some(
        (entity: MessageEntity) => entity.type === type
      );
    `
  },

  {
    name: 'hasAttachments',
    description: '`true` if property `attachments` is not empty (and has specified type)',
    isFunctionGetter: true,
    arguments: [`type?: AttachmentType | AttachmentTypeEnum`],
    returnType: 'boolean',
    code: stripIndent`
      if (type === undefined) return this.attachments.length !== 0;

      return this.attachments.some(
        (attachment: Attachment) => attachment.attachmentType === type
      );
    `
  },

  {
    name: 'getAttachments',
    description: 'Gets all attachments (or only specified typed ones)',
    isFunctionGetter: true,
    arguments: [`type?: AttachmentType | AttachmentTypeEnum`],
    returnType: 'Attachment[]',
    code: stripIndent`
      if (type === undefined) return this.attachments;

      return this.attachments.filter(
        (attachment: Attachment) => attachment.attachmentType === type
      );
    `
  },

  {
    name: 'hasReplyMessage',
    description: '`true` if property `replyMessage` is not empty',
    returnType: 'boolean',
    code: `return this.replyMessage !== undefined;`
  },

  {
    name: 'hasViaBot',
    description: '`true` if property `viaBot` is not empty',
    returnType: 'boolean',
    code: `return this.viaBot !== undefined;`
  },

  {
    name: 'hasStartPayload',
    description: '`true` if property `startPayload` is not empty',
    returnType: 'boolean',
    code: `return this.startPayload !== undefined;`
  }
];

export const MESSAGE_CONTEXT_GETTERS: Types.Getter[] = [
  ...ID_GETTERS,

  {
    name: 'chatType',
    description: 'Chat type',
    returnType: `Interfaces.TelegramChat['type'] | undefined`,
    code: `return this.chat?.type;`
  },

  ...CHAT_TYPE_GETTERS,

  {
    name: 'hasDice',
    description: '`true` if message has `dice` property',
    returnType: 'boolean',
    code: `return this.dice !== undefined;`
  },

  {
    name: 'startPayload',
    description: stripIndent`
      Returns parsed value after \`/start\` in the \`text\` property.
      Look [here](https://core.telegram.org/bots#deep-linking) for more.
    `,
    code: stripIndent`
      if (!this.hasText) return undefined;
      if (!this.text!.startsWith('/start') || this.text === '/start') {
        return undefined;
      }

      let payload = this.text!.split(' ')[1];

      if (!Number.isNaN(+payload)) {
        payload = Number.parseInt(payload, 10);
      } else if (isParseable(payload)) {
        payload = JSON.parse(payload);
      }

      return payload;
    `
  },

  ...HAS_GETTERS,

  {
    name: 'isForward',
    description: '`true` if this message is a forwarded one',
    returnType: 'boolean',
    code: `return this.forwardMessage !== undefined;`
  },

  {
    name: 'isEvent',
    description: '`true` if this update is an event',
    returnType: 'boolean',
    code: stripIndent`
      return events.some(
        event => Boolean(this[event[0] as keyof Message])
      );
    `
  },

  {
    name: 'eventType',
    description: 'Event type',
    returnType: 'MessageEventName | undefined',
    code: stripIndent`
      if (!this.isEvent) return undefined;

      const value: [keyof Message, MessageEventName] | undefined = events.find(
        (event) => {
          const tValue = this[event[0] as keyof Message];

          if (Array.isArray(tValue)) {
            return tValue.length !== 0;
          }

          return tValue !== undefined;
        }
      );

      if (value === undefined) return undefined;

      return value[1];
    `
  }
];

export class Getters {
  public static get MessageContext(): Types.Getter[] {
    return MESSAGE_CONTEXT_GETTERS;
  }
}

export default [
  ...MESSAGE_CONTEXT_GETTERS,

  {
    name: 'message',
    description: stripIndent`
      Message with the callback button that originated the query.
      Note that message content and message date will not be available if the message is too old.
    `,
    returnType: 'MessageContext | undefined',
    code: stripIndent`
      if (this.payload.message === undefined) return undefined;

      return new MessageContext({
        telegram: this.telegram,
        update: this.update,
        payload: this.payload.message,
        updateId: this.update?.update_id
      });
    `
  },

  {
    name: 'queryPayload',
    description: stripIndent`
      Data associated with the callback button.
      Be aware that a bad client can send arbitrary data in this field.
    `,
    code: stripIndent`
      const { data } = this.payload;

      if (data === undefined) return undefined;

      if (isParseable(data)) {
        return JSON.parse(data);
      }

      return data;
    `
  }
] as Types.Getter[];
