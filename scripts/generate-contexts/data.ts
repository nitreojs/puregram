import { Getters } from './getters';
import { GettersService } from './services';

import * as Types from './types';

export default [
  {
    name: 'MessageContext',
    description: 'Called when `message` event occurs',
    payload: 'TelegramMessage',
    updateType: 'message',
    hasCustomType: true,
    isCustomTypeRequired: false,
    isUpdateIdRequired: false,

    getters: GettersService.load(Getters.MessageContext),
    methods: [],

    fields: ['id', 'from', 'chat', 'createdAt']
  }
] as Types.ContextData[];
