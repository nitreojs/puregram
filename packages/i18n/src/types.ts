import { MessageContext } from 'puregram';

export type I18nMessageContext = MessageContext & I18nContext;

/* Holy shit */
export type RawRepository =
  /** { ru: { key: 'value' }, en: [['key', 'value']] } */
  | Record<string, Record<string, string> | [string, string][]>
  /** new Map([['ru', { key: 'value' }], ['en', [['key', 'value']]]]) */
  | Map<string, Record<string, string> | [string, string][]>;

/* new Map([['ru'], { key: 'value' }]) */
export type I18nRepository = Map<string, Record<string, string>>;

export interface I18nContext { }

export interface I18nOptions {
  locale: string;
  repository: RawRepository;
}
