import { FixtureIndex, IndexItem } from './fixtureindex';
import { fetchOFLFixture } from './githubhandler';
import { LocalStorageFixtureIndex } from './localstoragefixtureindex';
import { Fixture } from './types';

/**
 * The Fixture Library
 *
 * The main class for managing DMX-Fixtures.
 */
export class FixtureLibrary {
  private fixtureIndex: FixtureIndex | undefined;

  private localStorageFlag: boolean;

  private useOFLGithub: boolean;

  /**
   * @param useOFLGithub if Github should be used as a ressource
   * @param localStorage if local storage should be used to save files
   */
  constructor(useOFLGithub: boolean = true, localStorage: boolean = true) {
    this.useOFLGithub = useOFLGithub;
    this.localStorageFlag = localStorage;
    this.fixtureIndex = localStorage ? new LocalStorageFixtureIndex() : new FixtureIndex();
  }

  public async getFixture(key: string): Promise<Fixture | undefined> {
    const item = await this.fixtureIndex?.getIndexItem(key);
    // eslint-disable-next-line no-console
    console.log(item);
    // If we don't find it in the index we look for it on github
    if (!item && this.useOFLGithub) {
      const gh = await fetchOFLFixture(key);
      if (!gh) return undefined;
      // If the fetch was successfull we save the fixture and
      if (this.localStorageFlag) {
        await (this.fixtureIndex as LocalStorageFixtureIndex).createFile(key, 'ofl', gh);
        this.fixtureIndex?.setIndexItem(key, { path: `ofl/${key}.json` }, false);
      } else {
        this.fixtureIndex?.setIndexItem(key, { fixture: gh }, false);
      }
      return gh;
    }
    return item?.fixture;
  }

  public async setFixture(key: string, fixture: Fixture, alias: string = ''): Promise<Fixture> {
    // TODO Schema approval
    const item: IndexItem = {};
    if (this.localStorageFlag) {
      await (this.fixtureIndex as LocalStorageFixtureIndex).createFile(key, 'custom', fixture);
      this.fixtureIndex?.setIndexItem(key, { path: `custom/${key}.json` }, false);
    } else {
      this.fixtureIndex?.setIndexItem(key, { fixture }, false);
    }
    return fixture;
  }
}

export default FixtureLibrary;
