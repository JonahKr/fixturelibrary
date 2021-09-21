/* eslint-disable max-classes-per-file */

import { Fixture } from './types';

/**
 * Fixture Index Item
 */
export interface IndexItem {
  aliasOf?: string
  path?: string
  sha?: string
  url?: string
}

/**
 * When an item call is invalid due to it existing/not existing.
 */
export class ItemExistanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ItemExistanceError';
  }
}

/**
 * The in memory fixture index consisting of {@link IndexItem}s.
 *
 * The {@link FileFixtureIndex} is the recommended tool for managing the fixture index,
 * since it has a smaller memory footprint (in most cases).
 * This class should **ONLY** be used as the main index,
 * if local storage isn't viable or if only a few fixtures need to be used.
 */
export class FixtureIndex {
  /**
   * Internal index object.
   */
  private index: { [key:string]: IndexItem } = {};

  private fixtureCache: { [key:string]: Fixture } = {};

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
  public setIndexItem(
    key: string,
    data: IndexItem,
    override: boolean = true,
  ): void {
    if (!override && this.hasIndexItem(key)) {
      throw new ItemExistanceError('This Item already Exists in this FixtureIndex!');
    }
    let item = data;
    // If its an Alias, the referenced key has to be checked aswell
    if (data.aliasOf) {
      if (!this.hasIndexItem(data.aliasOf)) {
        throw new ItemExistanceError('The referenced item doesn`t exist in the index!');
      }
      // Safety measure to prevent additional data being passed
      item = { aliasOf: data.aliasOf };
    }
    this.index[key] = item;
  }

  /**
   * Checking if an {@link IndexItem} exists in the index.
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
   * Fetching an index item.
   * @param key fixture key
   * @returns The found IndexItem or undefined if nothing was found.
   */
  public getIndexItem(key: string): IndexItem | undefined {
    const item = this.index[key];
    if (item === undefined) return undefined;
    // If the IndexItem is an alias, we need to look for the corresponding key recursively
    if (item.aliasOf) return this.getIndexItem(item.aliasOf);
    return item;
  }

  public cacheFixture(key: string, fixture: Fixture) {
    this.fixtureCache[key] = fixture;
  }

  public fixtureFromCache(key: string): Fixture | undefined {
    return this.fixtureCache[key];
  }
}
