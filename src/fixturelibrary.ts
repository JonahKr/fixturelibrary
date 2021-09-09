import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { FixtureIndex, IndexItem } from './fixtureindex';
import { fetchOflFixture, fetchOflFixtureDirectory, TruncatedDataError } from './githubhandler';
import { LocalStorageFixtureIndex } from './localstoragefixtureindex';
import { Fixture } from './types';

import * as schema from './ofl-schema/ofl-fixture.json';

/**
 * The Fixture Library
 *
 * The main class for managing DMX-Fixtures.
 * ## Example - `commonJs`
 * ```js
 * const fixturelib = require('fixturelibrary');
 * const fl = new fixturelib.FixtureLibrary();
 *
 * async function foo(){
 *  // Downloading the OpenFixtureLibrary
 *  await fl.downloadOfl();
 *  console.log(`Successfully Downloaded OFL!`);
 *  // Fetching a Fixture from the Library
 *  const fixture = await fl.getFixture('cameo/auro-spot-300');
 *  console.log(`${fixture.name} has ${fixture.modes.length} Modes.`);
 *
 *  // This will return true since we're validating a fixture from Ofl.
 *   console.log(fl.validate(fixture));
 * }
 * ```
 *
 * ## Example - `ESM/TS`
 * ```ts
 * import { FixtureLibrary } from 'fixturelibrary';
 *
 * const fl = new FixtureLibrary();
 * await fl.downloadOfl();
 * const fixture = await fl.getFixture('arri/broadcaster-2-plus');
 * ```
 */
export class FixtureLibrary {
  /**
   * @internal
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
   * @param localStorage if local storage should be used to save files
   * @param useOFLGithub if Github should be used as a ressource
   */
  constructor(localStorage: boolean = true, useOFLGithub: boolean = true) {
    this.useOFLGithub = useOFLGithub;
    this.fixtureIndex = localStorage ? new LocalStorageFixtureIndex() : new FixtureIndex();
    // Json Validation Setup
    this.ajv = new Ajv({
      verbose: true,
      strict: false,
      allErrors: true,
      discriminator: true,
    }).addKeyword('version').addFormat('color-hex', true);
    addFormats(this.ajv);
  }

  /**
   * Get a Fixture from the Library or OFL if allowed.
   * @param key Key of the fixture
   * @param override if existing entries should be overwritten
   * @returns Fixture Definition or undefined if not found
   */
  public async getFixture(key: string, override = false):
  Promise<Fixture | undefined> {
    let item;
    if (!override) {
      item = await this.fixtureIndex?.getIndexItem(key);
    }
    // If we don't find it in the index we look for it on github
    if ((override || !item) && this.useOFLGithub) {
      const gh = await fetchOflFixture(key);
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
   * **ONLY** available when allowing github usage.
   * Downloading the whole Open Fixture Library to the fixture index.
   * The Fixtureindex should, after a successfull download, have an additional ~30KB in size.
   * @param override
   */
  public async downloadOfl(override = false): Promise<void> {
    if (!this.useOFLGithub) {
      console.error('Using Github is disabled!');
    } else {
      try {
        const ofl = await fetchOflFixtureDirectory();
        ofl?.forEach(async (e) => {
          if (e.path === 'manufacturers.json') return;
          await this.getFixture(e.path.slice(0, -5), override);
        });
      } catch (error) {
        if (error instanceof TruncatedDataError) return;
        console.error(error);
      }
      if (this.fixtureIndex instanceof LocalStorageFixtureIndex) {
        await this.fixtureIndex.updateIndex();
      }
    }
  }
}

export default FixtureLibrary;
