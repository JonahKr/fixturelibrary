import { FixtureIndex } from './fixtureindex';
// import { StorageHandler } from './storagehandler';

class FixtureLibrary {
  storageHandler: FixtureIndex | undefined;

  useOFLGithub: boolean;

  constructor(useOFLGithub: boolean = true, localStorage: boolean = true) {
    this.useOFLGithub = useOFLGithub;
    this.storageHandler = localStorage ? new FixtureIndex() : undefined;
  }
  /**
  public async getFixture(fixturekey: string): Promise<Fixture | undefined> {
    // by checking for a forewardslash
    const slash = fixturekey.includes('/');
    this.storageHandler?.index;
    return undefined;
  }
  */
}

export default FixtureLibrary;
