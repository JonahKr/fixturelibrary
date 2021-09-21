import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { pathExistsSync, readJSONSync } from 'fs-extra';
import { FixtureIndex } from './fixtureindex';
import {
  fetchOflFixtureDirectory, githubRawFixtureRequest, request,
} from './webhandler';
import { Fixture } from './types';

import * as schema from './ofl-schema/ofl-fixture.json';
import { readJsonFile, storageDirectory, writeJsonFile } from './filehandler';

/**
 * The Fixture Library
 *
 * The main class for managing DMX-Fixtures.
 * ## Example - `commonJs`
 * ```js
 * const { FixtureLibrary } = require('fixturelibrary');
 * const fl = new FixtureLibrary();
 *
 * async function foo(){
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
 * const fixture = await fl.getFixture('arri/broadcaster-2-plus');
 * ```
 */
export class FixtureLibrary {
  /**
   * @internal
   * The FixtureIndex object storing/handling storage of fixture definition
   */
  private fixtureIndex: FixtureIndex;

  /**
   * @internal
   * Flag for if downloads from the web are allowed
   */
  private webAccess: boolean;

  /**
   * @internal
   * Storing the Json Schema Validator object
   */
  private ajv: Ajv;

  /**
   * @param webAccess if web requests are allowed
   */
  constructor(webAccess: boolean = true) {
    this.webAccess = webAccess;
    this.fixtureIndex = new FixtureIndex();
    // Loading the index file
    // Trying to recreate index from savefile: index.json
    // Improvements: Async or filestreams?
    if (pathExistsSync(`${storageDirectory}/index.json`)) {
      try {
        this.fixtureIndex.setIndex(readJSONSync(`${storageDirectory}/index.json`));
      } catch (error) {
        console.error(error);
      }
    }

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
   * Saving the Index to a file to be available after execution.
   */
  private async saveIndex(): Promise<void> {
    writeJsonFile('index.json', this.fixtureIndex.getIndex(), true);
  }

  /**
   * Get a Fixture from the Library or OFL if allowed.
   * This relies on reading definitions from file/web and caching.
   * Execution time depends on the size of the definition (.6 - 4ms) and if it was cached (.01ms).
   * In Case it needs to be downloaded, it will take alot longer. (depending on your connection)
   * @param key Key of the fixture
   * @param override if existing entries should be overwritten
   * @returns Fixture Definition or undefined if not found
   */
  public async getFixture(key: string):
  Promise<Fixture | undefined> {
    // At first trying to get cached fixture definitions
    let fixture = this.fixtureIndex.fixtureFromCache(key);
    if (fixture) return fixture;
    const item = await this.fixtureIndex.getIndexItem(key);
    if (item?.path) {
      fixture = await readJsonFile(item.path);
      if (fixture) this.fixtureIndex.cacheFixture(key, fixture);

    // If we find a url in the index we download the fixture
    } else if (this.webAccess) {
      let file;
      const sha = item?.sha;
      if (item?.url) {
        file = await request(key) as Fixture | undefined;
      // If a github Sha is stored, we can request the fixture from github
      } else if (item?.sha && this.webAccess) {
        file = await githubRawFixtureRequest(`${key}.json`) as Fixture;
      }
      if (file) {
        fixture = await this.setFixture(key, file, sha, true, true);
      }
    }
    return fixture;
  }

  /**
   * Adding a new fixture to the Library.
   * @param key new and unique fixture key
   * @param fixture Fixture Definition
   * @param sha The version SHA of the fixture (Can be usefull for Versioning)
   * @param validate If the fixture should be validated against the OFL Schema
   * @param override If existing entries should be overwritten
   * @returns The passed Fixture Definition to enable method chaining
   */
  public async setFixture(key: string, fixture: Fixture, sha = '', validate = true, override = false):
  Promise<Fixture | undefined> {
    if (!fixture) return undefined;
    if (this.fixtureIndex.hasIndexItem(key) && !override) return undefined;
    if (validate && !this.validate(fixture)) return undefined;
    // If the key is new and the definition is valid, we save it to file
    await writeJsonFile(key, fixture, override);
    this.fixtureIndex.setIndexItem(key, { path: key, sha });
    this.fixtureIndex.cacheFixture(key, fixture);
    await this.saveIndex();
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
   * This call has a long executiontime and is therefore **Not Recommended** to be used in scripts!
   * Please use `npx syncOfl shallow` instead!
   *
   * Insteadof {@link downloadOfl}, this only downloads the references to the OFL fixtures
   * and none of the files.
   * @returns List of all the fixtures which got updated.
   */
  public async fetchOfl(): Promise<string[] | void> {
    if (!this.webAccess) return console.error('Web Access is disabled');
    const ofl = await fetchOflFixtureDirectory();

    const updatedFixtures: string[] = [];

    ofl?.forEach(async (fixture) => {
      if (fixture.path !== 'manufacturers.json') {
        // Removing the .json from the end of the file
        const key = fixture.path.slice(0, -5);
        const item = this.fixtureIndex.getIndexItem(key);
        // If the SHA of the fixture doens't match, the index gets overwritten
        if (item?.sha !== fixture.sha) {
          this.fixtureIndex.setIndexItem(key, { sha: fixture.sha });
          updatedFixtures.push(key);
        }
      }
    });
    await this.saveIndex();
    return updatedFixtures;
  }

  /**
   * This call has a long executiontime and is therefore **Not Recommended** to be used in scripts!
   * Please use `npx syncOfl` instead!
   *
   * **ONLY** available when allowing web access usage.
   * Downloading the whole Open Fixture Library to the fixture index.
   * The Fixtureindex should, after a successfull download, have an additional ~30KB in size.
   * @returns List of all the fixtures which got updated.
   */
  public async downloadOfl(): Promise<string[] | void> {
    if (!this.webAccess) return console.error('Web Access is disabled');
    const ofl = await fetchOflFixtureDirectory();

    const updatedFixtures: string[] = [];

    ofl?.forEach(async (fixture) => {
      if (fixture.path !== 'manufacturers.json') {
        // Removing the .json from the end of the file
        const key = fixture.path.slice(0, -5);
        const item = this.fixtureIndex.getIndexItem(key);
        // If the SHA of the fixture doens't match, the index gets overwritten
        if ((item?.path && item?.sha !== fixture.sha) || !item?.path) {
          updatedFixtures.push(key);
          // eslint-disable-next-line no-await-in-loop
          const file = await githubRawFixtureRequest(`${key}.json`) as Fixture;
          await this.setFixture(key, file, fixture.sha, false, true);
        }
      }
    });
    await this.saveIndex();
    return updatedFixtures;
  }
}

export default FixtureLibrary;
