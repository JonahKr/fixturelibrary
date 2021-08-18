import { outputJSON, readJSON } from 'fs-extra';
import { FixtureIndex, IndexItem, ItemExistanceError } from './fixtureindex';
import { Fixture } from './types';

/**
 * Options to choose a subdirectory.
 */
type PathOptions = 'ofl' | 'custom' | undefined;

/**
 * Extension of {@link FixtureIndex} with local storage.
 *
 * The LocalStorageFixtureIndex acts as a extension to the in memory FixtureIndex which allows
 * storing fixture definitions in external files and saving the fixture index with it's aliases
 * or path references. This is especially usefull when the Open Fixture Library is used
 * since it can be used offline if downloaded once.
 */
export class LocalStorageFixtureIndex extends FixtureIndex {
  /**
   * The Directory which should be used for everything.
   */
  public storageDirectory: string;

  /**
   * The Directory to use for OFL files.
   * `ofl` will be mapped to this directory automatically aswell.
   */
  public oflName: string;

  /**
   * Directory to store custom fixture definitions to.
   * `custom` will be mapped to this directory automatically aswell.
   */
  public customName: string;

  /**
   * @param storageDirectory name of the storage directory
   * @param oflName directory name for OFL realated files
   * @param customName directory name for custom fixtures
   */
  constructor(storageDirectory = './\\.fixturelibrary', oflName: string = 'ofl', customName: string = 'custom') {
    super();
    this.storageDirectory = storageDirectory;
    this.oflName = oflName;
    this.customName = customName;

    // Try to recreate index from savefile: index.json
    const index = readJSON(`${storageDirectory}/index.json`) as unknown as { [key:string]: IndexItem };
    if (index !== undefined) super.setIndex(index);
  }

  public setIndexItem(key: string, data: IndexItem, override?: boolean): void {
    // Possible Key entries: "ofl/arri/skypanel-s120c", "custom/fixturebaz", "fixtfoobar"
    let item: IndexItem = {};
    // Now there are three options:
    // First it could be a alias
    if (data.aliasOf) {
      if (!this.hasIndexItem(data.aliasOf)) throw new ItemExistanceError('The referenced item doesn`t exist in the index!');
      item = { aliasOf: data.aliasOf };

    // Secondly it could be a path definition
    } else if (data.path) {
      item = { path: this.standardizePath(data.path) };

    // Third Option is a fixture definition
    // It will just be kept in the index.
    } else if (data.fixture) {
      item = { fixture: data.fixture };
    // empty data was provided
    } else {
      throw new Error('The data provided is empty!');
    }
    super.setIndexItem(key, item, override);
    // this.updateIndexFile();
  }

  public getIndexItem(key: string): IndexItem | undefined {
    return super.getIndexItem(key);
  }

  /**
   * Fetching a {@link Fixture} object from the index.
   * This will look in the storage directory aswell.
   * @param key
   * @returns
   */
  public async getFixture(key: string): Promise<Fixture | undefined> {
    const indexsearch = super.getIndexItem(key);
    // Now we have the item which is definitely not a alias since its recursive
    // If the returned item already contains a fixture definition
    if (indexsearch?.fixture) return indexsearch.fixture;
    // If the key references a path we look it up
    if (indexsearch?.path) {
      return await readJSON(this.realizePath(indexsearch.path)) as unknown as Fixture;
    }
    return undefined;
  }

  public setAlias(key: string, alias: string): void {
    super.setAlias(key, alias);
    // this.updateIndexFile();
  }

  /**
   * @internal
   * Parsing any path to a standardized format.
   * e.g. "foobar" -> "custom/foobar"
   * @param path
   */
  private standardizePath(path: string): string {
    const slash = path.split('/');
    if (slash.length > 1) {
      const postPrefix: string = slash.slice(1).join('/');
      // If its ofl prefix -> ofl/
      if (slash[0] === ('ofl' || this.oflName)) {
        return `ofl/${postPrefix}`;
        // if its custom prefix -> custom/
      }
      if (slash[0] === ('custom' || this.customName)) {
        return `custom/${postPrefix}`;
      }
      // If we only have no directory defined -> custom
    }
    return `custom/${path}`;
  }

  /**
   * @internal
   * Parsing any standardized path to the real file path
   * @param path
   */
  private realizePath(path: string): string {
    const slash = path.split('/');
    const postPrefix: string = slash.slice(1).join('/');
    let dir = '';
    if (slash[0] === 'ofl') dir = this.oflName;
    if (slash[0] === 'custom') dir = this.customName;
    return `${this.storageDirectory}/${dir}/${postPrefix}`;
  }

  public async updateIndexFile(): Promise<void> {
    await outputJSON(`${this.storageDirectory}/index.json`, super.getIndex());
  }

  public async createFile(name: string, directory: PathOptions, data: {} | []): Promise<boolean> {
    let path = `${this.storageDirectory}/`;
    if (!directory) {
      path = `${path}${name}`;
    } else {
      path = `${path}${directory}/${name}`;
    }
    try {
      await outputJSON(path, data);
    } catch (err) {
      console.error(err);
      return false;
    }
    return true;
  }
}

export default LocalStorageFixtureIndex;
