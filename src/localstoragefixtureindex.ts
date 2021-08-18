import { ensureDir, outputJSON, readJSON } from 'fs-extra';
import { FixtureIndex, IndexItem, parseFixtureKey } from './fixtureindex';

type PathOptions = 'ofl' | 'custom' | undefined;

export class LocalStorageFixtureIndex extends FixtureIndex {
  public storageDirectory: string;

  public oflName: string;

  public customName: string;

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
    const vkey = parseFixtureKey(key);
    if (data.fixture) {
      this.createFile(vkey, 'custom', data.fixture);
      super.setIndexItem(vkey, { path: `custom/${vkey}.json` }, override);
    } else {
      super.setIndexItem(vkey, data, override);
    }
    this.updateIndexFile();
  }

  /**
   * @ignore
  public getIndexItem(key: string): IndexItem | undefined {
    const indexsearch = super.getIndexItem(key);
    // Now we have the item which is definitely not a alias
    if (indexsearch?.path) {

    }
  }
  */

  public setAlias(key: string, alias: string): void {
    super.setAlias(key, alias);
    this.updateIndexFile();
  }

  public async setup() {
    await this.createDirectory('');
    await this.createDirectory(this.oflName);
    await this.createDirectory(this.customName);
  }

  public async updateIndexFile(): Promise<void> {
    await outputJSON(`${this.storageDirectory}/index.json`, super.getIndex());
  }

  public async createDirectory(path: string): Promise<boolean> {
    try {
      await ensureDir(`${this.storageDirectory}${`/${path}`}`);
    } catch (err) {
      return false;
    }
    return true;
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

  // eslint-disable-next-line class-methods-use-this
  public async readFile(path: string): Promise<any> {
    try {
      return await readJSON(path);
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }
}

export default LocalStorageFixtureIndex;
