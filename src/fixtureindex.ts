/* eslint-disable max-classes-per-file */
import { Fixture } from './types';

/**
 * A IndexItem can be either a fixturedefinition, a path to a fixture definition
 * or a alias pointing to another key in the index.
 */
export interface IndexItem {
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

/**
 *
 * @param key the fixture key to be parsed
 * @returns the parsed fixture key
 * @throws {KeyInvalidError} if / is used in fixture key
 */
export function parseFixtureKey(key: string): string {
  const slash = key.split('/');
  if (slash[0] === 'custom' && slash.length === 2) return slash[1];
  if (slash.length > 1) throw new KeyInvalidError('The Symbol / cannot be used for naming a fixture!');
  return key;
}

/**
 * The in memory fixture index consisting of {@linkcode IndexItem}s.
 *
 * The {@link LocalStorageFixtureIndex} is the recommended tool for managing the fixture index,
 * since it has a smaller memory footprint (in most cases).
 * This class should **ONLY** be used as the main index,
 * if local storage isn't viable or if only a few fixtures need to be used.
 */
export class FixtureIndex {
  /**
   * Internal index object.
   */
  private index: { [key:string]: IndexItem } = {};

  /**
   * @ignore
   * @returns the index Object.
   */
  public getIndex(): { [key:string]: IndexItem } {
    return this.index;
  }

  /**
   * @ignore
   * @param data the object the index should be overwritten with
   */
  public setIndex(data: { [key:string]: IndexItem }): void {
    this.index = data;
  }

  /**
   * Adding a {@link IndexItem} to the index.
   * @param key fixture key
   * @param data a {@link IndexItem} object
   * @param override if a existing entry should be overwritten
   */
  public setIndexItem(key: string, data: IndexItem, override: boolean = true): void {
    if (this.hasIndexItem(key) && !override) {
      throw new ItemExistsError('This Item already Exists in this FixtureIndex!');
    }
    this.index[key] = data;
  }

  /**
   * Checking if a {@link IndexItem} exists in the index.
   * @param key fixture key
   * @returns if the key was found in the index
   */
  public hasIndexItem(key: string): boolean {
    let flag = false;
    Object.keys(this.index).forEach((e) => {
      if (e === key) flag = true;
    });
    return flag;
  }

  /**
   * Fetching a index item.
   * @param key fixture key
   * @returns The found IndexItem or undefined if nothing was found.
   */
  public getIndexItem(key: string): IndexItem | undefined {
    const item = this.index[key];
    if (item === undefined) return undefined;
    // If the IndexItem is a alias, we need to look for the corresponding key recursively
    if (item.aliasOf) return this.getIndexItem(item.aliasOf);
    return item;
  }

  /**
   * Creating a alias for any key in the index. If a non existing key is targeted,
   * querying the index will always result in `undefined`.
   * @param key fixture key
   * @param alias alias for the fixture key
   */
  public setAlias(key: string, alias: string): void {
    this.setIndexItem(alias, { aliasOf: key });
  }
}