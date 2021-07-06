import { I18nManager } from './src';

const manager = new I18nManager();
manager.load({ ru: { key: 'value' } });
/* manager.hasLocale('ru') */
/* manager.setLocale('ru') */
/* manager.addLocale('en', { key: 'value' }) */
/* manager._('key') */
/* manager._('key', 'en') */