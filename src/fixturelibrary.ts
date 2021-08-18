import { FixtureIndex } from './fixtureindex';
import { fetchOFLFixture } from './githubhandler';
import { LocalStorageFixtureIndex } from './localstoragefixtureindex';
import { Fixture } from './types';

/**
 * The Fixture Library
 *
 * The main class for managing DMX-Fixtures.
 */
export class FixtureLibrary {
  storageHandler: FixtureIndex | undefined;

  localStorageFlag: boolean;

  useOFLGithub: boolean;

  /**
   * @param useOFLGithub if Github should be used as a ressource
   * @param localStorage if local storage should be used to save files
   */
  constructor(useOFLGithub: boolean = true, localStorage: boolean = true) {
    this.useOFLGithub = useOFLGithub;
    this.localStorageFlag = localStorage;
    this.storageHandler = localStorage ? new LocalStorageFixtureIndex() : new FixtureIndex();
  }

  public async getFixture(key: string): Promise<Fixture | undefined> {
    const item = await this.storageHandler?.getIndexItem(key);
    // eslint-disable-next-line no-console
    console.log(item);
    // If we don't find it in the index we look on github for it
    if (!item && this.useOFLGithub) {
      const gh = await fetchOFLFixture(key);
      if (!gh) return undefined;
      // If the fetch was successfull we save the fixture and
      if (this.localStorageFlag) {
        await (this.storageHandler as LocalStorageFixtureIndex).createFile(key, 'ofl', gh);
        this.storageHandler?.setIndexItem(key, { path: `ofl/${key}.json` }, false);
      } else {
        this.storageHandler?.setIndexItem(key, { fixture: gh }, false);
      }
      return gh;
    }
    return item?.fixture;
  }
}

export default FixtureLibrary;
