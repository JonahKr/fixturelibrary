import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { FixtureIndex, IndexItem } from './fixtureindex';
import { fetchOFLFixture } from './githubhandler';
import { LocalStorageFixtureIndex } from './localstoragefixtureindex';
import { Fixture } from './types';

import * as schema from './ofl-schema/ofl-fixture.json';

/**
 * The Fixture Library
 *
 * The main class for managing DMX-Fixtures.
 */
export class FixtureLibrary {
  private fixtureIndex: FixtureIndex | undefined;

  private useOFLGithub: boolean;

  private ajv: Ajv;

  /**
   * @param useOFLGithub if Github should be used as a ressource
   * @param localStorage if local storage should be used to save files
   */
  constructor(useOFLGithub: boolean = true, localStorage: boolean = true) {
    this.useOFLGithub = useOFLGithub;
    this.fixtureIndex = localStorage ? new LocalStorageFixtureIndex() : new FixtureIndex();
    // Json Validation Setup
    this.ajv = new Ajv({
      verbose: true,
      strict: false,
      allErrors: true,
      discriminator: true,
    });
    addFormats(this.ajv);
    this.ajv.addKeyword(`version`);
    this.ajv.addFormat(`color-hex`, true);
  }

  public async getFixture(key: string): Promise<Fixture | undefined> {
    const item = await this.fixtureIndex?.getIndexItem(key);
    // eslint-disable-next-line no-console
    console.log(item);
    // If we don't find it in the index we look for it on github
    if (!item && this.useOFLGithub) {
      const gh = await fetchOFLFixture(key);
      if (!gh) return undefined;
      // If the fetch was successfull we save the fixture to the index
      this.fixtureIndex?.setIndexItem(key, { fixture: gh }, false);
      return gh;
    }
    return item?.fixture;
  }

  public async setFixture(key: string, fixture: Fixture, oflValidation = true): Promise<Fixture|undefined> {
    if (oflValidation && !this.validate(fixture)) {
      console.error('Fixture could not be validated');
      return undefined;
    }
    const item: IndexItem = { fixture };
    this.fixtureIndex?.setIndexItem(key, item, false);
    return fixture;
  }

  private validate(fixture: any): boolean {
    const valid = this.ajv.validate(schema, fixture);
    if (!valid) console.log(this.ajv.errors);
    return valid;
  }

}

export default FixtureLibrary;
