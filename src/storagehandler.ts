import { ensureDir, outputJSON, readJSON } from 'fs-extra';

type PathOptions = 'ofl' | 'custom' | undefined;

export class StorageHandler {
  storageDirectory: string;

  oflName: string;

  customName: string;

  constructor(storageDirectory = './\\.fixturelibrary', oflName: string = 'ofl', customName: string = 'custom') {
    this.storageDirectory = storageDirectory;
    this.oflName = oflName;
    this.customName = customName;
  }

  public async setup() {
    await this.createDirectory('');
    await this.createDirectory(this.oflName);
    await this.createDirectory(this.customName);
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

export default StorageHandler;
