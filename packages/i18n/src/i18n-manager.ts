import { Middleware } from 'middleware-io';

import * as Types from './types';
import * as Constants from './utils/constants';
import { isPlainObject } from './utils/helpers';

export class I18nManager {
  constructor(
    public repository: Types.RawRepository | Types.I18nRepository = Constants.defaultRepository
  ) {
    this.parse();
  }

  private parse(): Types.I18nRepository {
    let repository: Types.I18nRepository = new Map<string, Record<string, string>>();
    const object: Record<string, Record<string, string>> = {};

    if (isPlainObject(this.repository)) {
      const entries: [string, Record<string, string> | [string, string][]][] = Object.entries(this.repository);

      for (const [language, data] of entries) {
        if (!object[language]) {
          object[language] = {};
        }

        for (const [key, value] of Array.isArray(data) ? data : Object.entries(data)) {
          object[language][key] = value;
        }
      }
    } else { // Map
      

      this.repository
    }

    console.log(object);

    repository = new Map<string, Record<string, string>>(Object.entries(object));

    return repository;
  }

  public load(repository: Types.RawRepository): void {
    this.repository = repository;

    this.parse();
  }

  public get middleware(): Middleware<Types.I18nContext> {
    return (context: Types.I18nContext, next) => {

    };
  }
}