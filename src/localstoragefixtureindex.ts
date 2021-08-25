import { outputJSON, pathExists, readJSON } from 'fs-extra';
import { FixtureIndex, IndexItem, ItemExistanceError } from './fixtureindex';

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
   * @param storageDirectory name of the storage directory
   */
  constructor(storageDirectory = './\\.fixturelibrary') {
    super();
    this.storageDirectory = storageDirectory;

    // Try to recreate index from savefile: index.json
    // if (pathExistsSync(`${storageDirectory}/index.json`)) {
    //   const index = this.readFile('index.json') as unknown as { [key:string]: IndexItem };
    //   if (index !== undefined) super.setIndex(index);
    // }
    try {
      this.readFile('index.json').then((e) => super.setIndex(e));
    } catch (error) {
      if (!(error instanceof ItemExistanceError)) console.error(error);
    }
  }

  public async setIndexItem(key: string, data: IndexItem, override?: boolean): Promise<void> {
    let item: IndexItem = {};
    // Now there are three options:
    // 1. Alias
    if (data.aliasOf) {
      if (!this.hasIndexItem(data.aliasOf)) throw new ItemExistanceError('The referenced item doesn`t exist in the index!');
      item = { aliasOf: data.aliasOf };

    // 2. Path
    } else if (data.path) {
      item = { path: data.path };

    // 3. Fixture
    // In this case a file will be created and a path pushed to the index.
    } else if (data.fixture) {
      await this.createFile(key, data.fixture);
      item = { path: key };
    // empty data was provided
    } else {
      throw new Error('The data provided is empty!');
    }
    super.setIndexItem(key, item, override);
    this.updateIndexFile();
  }

  /**
   * Fetching a {@link Fixture} object from the index.
   * This will look in the storage directory aswell.
   * @param key
   * @returns
   */
  public async getIndexItem(key: string): Promise<IndexItem | undefined> {
    const indexsearch = await super.getIndexItem(key);
    // Now we have the item which is definitely not a alias since its recursive
    // If the returned item already contains a fixture definition
    if (indexsearch?.fixture) return indexsearch;
    // If the key references a path we look it up
    if (indexsearch?.path) {
      return { fixture: await this.readFile(indexsearch.path) };
    }
    return undefined;
  }

  public async updateIndexFile(): Promise<void> {
    await outputJSON(`${this.storageDirectory}/index.json`, super.getIndex());
  }

  private async createFile(name: string, data: {} | [], override = false): Promise<boolean> {
    // Preparing path
    let path = `${this.storageDirectory}/${name}`;
    if (!path.endsWith('.json')) path += '.json';
    // Checking if file already exists
    if (!override && await pathExists(path)) {
      throw new ItemExistanceError(`This file at ${path} already exist!`);
    }
    try {
      await outputJSON(path, data);
    } catch (err) {
      console.error(err);
      return false;
    }
    return true;
  }

  private async readFile(filename: string): Promise<any> {
    // Preparing path
    let path = `${this.storageDirectory}/${filename}`;
    if (!filename.endsWith('.json')) path += '.json';
    // Checking if file exists
    if (!await pathExists(path)) {
      throw new ItemExistanceError(`${path} doesn't exist!`);
    }
    try {
      return await readJSON(path);
    } catch (err) {
      console.error(err);
    }
    return undefined;
  }
}

export default LocalStorageFixtureIndex;
