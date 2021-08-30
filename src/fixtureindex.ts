/* eslint-disable max-classes-per-file */
import { Fixture } from './types';

/**
 * - **aliasOf**: key of other IndexItem - "fixtxyz"
 * - **fixture**: {@link Fixture} definition
 * - **path**: (LocalStorage) path to a fixture definition - "ofl/adb/alc4", "custom/fixtxyz"
 */
export interface IndexItem {
  aliasOf?: string
  fixture?: Fixture
  path?: string
}

export class ItemExistanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ItemExistanceError';
  }
}

/**
 * The in memory fixture index consisting of {@link IndexItem}s.
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
  public async setIndexItem(key: string, data: IndexItem, override: boolean = true): Promise<void> {
    if (this.hasIndexItem(key) && !override) {
      throw new ItemExistanceError('This Item already Exists in this FixtureIndex!');
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
  public async getIndexItem(key: string): Promise<IndexItem | undefined> {
    const item = this.index[key];
    if (item === undefined) return undefined;
    // If the IndexItem is a alias, we need to look for the corresponding key recursively
    if (item.aliasOf) return this.getIndexItem(item.aliasOf);
    return item;
  }
}
