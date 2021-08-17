/* eslint-disable max-classes-per-file */
import { Fixture } from './types';

export interface Indexitem {
  aliasOf?: string
  fixture?: Fixture
  path?: string
}

class ItemExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ItemExistsError';
  }
}

class KeyInvalidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KeyInvalidError';
  }
}

export function parseFixtureKey(key: string): string {
  const slash = key.split('/');
  if (slash[0] === 'custom' && slash.length === 2) return slash[1];
  if (slash.length > 1) throw new KeyInvalidError('The Symbol / cannot be used for naming a fixture!');
  return key;
}

export class FixtureIndex {
  private index: { [key:string]: Indexitem } = {};

  public getIndex(): { [key:string]: Indexitem } {
    return this.index;
  }

  public setIndex(data: { [key:string]: Indexitem }): void {
    this.index = data;
  }

  public setIndexItem(key: string, data: Indexitem, override: boolean = true): void {
    if (this.hasIndexitem(key) && !override) {
      throw new ItemExistsError('This Item already Exists in this FixtureIndex!');
    }
    this.index[key] = data;
  }

  public hasIndexitem(key: string): boolean {
    let flag = false;
    Object.keys(this.index).forEach((e) => {
      if (e === key) flag = true;
    });
    return flag;
  }

  public getIndexItem(key: string): Indexitem | undefined {
    const item = this.index[key];
    if (item === undefined) return undefined;
    if (item.aliasOf) return this.getIndexItem(item.aliasOf);
    return item;
  }

  public setAlias(key: string, alias: string) {
    this.setIndexItem(alias, { aliasOf: key });
  }
}
