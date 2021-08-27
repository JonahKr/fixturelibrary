import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { FixtureIndex, IndexItem } from './fixtureindex';
import { fetchOFLFixture, fetchOFLFixtureDirectory } from './githubhandler';
import { LocalStorageFixtureIndex } from './localstoragefixtureindex';
import { Fixture } from './types';

import * as schema from './ofl-schema/ofl-fixture.json';

/**
 * The Fixture Library
 *
 * The main class for managing DMX-Fixtures.
 */
export class FixtureLibrary {
  /**
   * The FixtureIndex object storing/handling storage of fixture definition
   */
  private fixtureIndex: FixtureIndex | undefined;

  /**
   * @internal
   * Flag for if Github should be used or not
   */
  private useOFLGithub: boolean;

  /**
   * @internal
   * Storing the Json Schema Validator object
   */
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
    this.ajv.addKeyword('version');
    this.ajv.addFormat('color-hex', true);
  }

  /**
   * Get a Fixture from the Library or OFL if allowed.
   * @param key Key of the fixture
   * @param override if existing entries should be overwritten
   * @returns Fixture Definition or undefined if not found
   */
  public async getFixture(key: string, override = false):
  Promise<Fixture | undefined> {
    const item = await this.fixtureIndex?.getIndexItem(key);
    // If we don't find it in the index we look for it on github
    if ((override || !item) && this.useOFLGithub) {
      const gh = await fetchOFLFixture(key);
      if (!gh) return undefined;
      // If the fetch was successfull we save the fixture to the index
      await this.fixtureIndex?.setIndexItem(key, { fixture: gh }, override);
      if (this.fixtureIndex instanceof LocalStorageFixtureIndex) {
        await this.fixtureIndex.updateIndex();
      }
      return gh;
    }
    return item?.fixture;
  }

  /**
   * Adding a new fixture to the Library.
   * @param key new and unique fixture key
   * @param fixture Fixture Definition
   * @param oflValidation If the fixture should be validated against the OFL Schema
   * @param override if existing entries should be overwritten
   * @returns The passed Fixture Definition to enable method chaining
   */
  public async setFixture(key: string, fixture: Fixture, oflValidation = true, override = false):
  Promise<Fixture | undefined> {
    if (oflValidation && !this.validate(fixture)) {
      // TODO: Proper Error
      console.error('Fixture could not be validated');
      return undefined;
    }
    const item: IndexItem = { fixture };
    this.fixtureIndex?.setIndexItem(key, item, override);
    return fixture;
  }

  /**
   * Validate a fixture definition against the Open Fixture Library Schema
   * @param fixture the fixture definition
   * @returns wether the fixture is applicable to the schema or not
   */
  public validate(fixture: any): boolean {
    const valid = this.ajv.validate(schema, fixture);
    if (!valid) console.error(this.ajv.errors);
    return valid;
  }

  /**
   * @internal
   * Similar to getFixture but directly resorts to github polling
   * @param key
   * @returns
   */
  private async fetchFixture(key: string, override: boolean) {
    const gh = await fetchOFLFixture(key);
    if (!gh) return;
    await this.fixtureIndex?.setIndexItem(key, { fixture: gh }, override);
    if (this.fixtureIndex instanceof LocalStorageFixtureIndex) {
      await this.fixtureIndex.updateIndex();
    }
  }

  /**
   * *ONLY* available when allowing github usage.
   * Downloading the whole Open Fixture Library
   * @param override
   */
  public async downloadOFL(override = false): Promise<void> {
    if (!this.useOFLGithub) {
      console.error('Using Github is disabled!');
    } else {
      const ofl = await fetchOFLFixtureDirectory();
      ofl?.forEach(async (e) => {
        await this.fetchFixture(e.path.slice(0, -5), override);
      });
      if (this.fixtureIndex instanceof LocalStorageFixtureIndex) {
        await this.fixtureIndex.updateIndex();
      }
    }
  }
}

export default FixtureLibrary;
