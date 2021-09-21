/* eslint-disable import/prefer-default-export */
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
   * @param webAccess if Github can be used as a ressource
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
        file = await githubRawFixtureRequest(key) as Fixture;
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
   * @param sha The version SHAsum of the fixture (Can be usefull for Updating)
   * @param validate If the fixture should be validated against the OFL Schema
   * @param override if existing entries should be overwritten
   * @returns The passed Fixture Definition to enable method chaining
   */
  public async setFixture(key: string, fixture: Fixture, sha = '', validate = true, override = false):
  Promise<Fixture | undefined> {
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
   * Insteadof {@link downloadOfl}, this only downloads the references to the OFL fixtures
   * and none of the files.
   */
  public async fetchOfl(): Promise<void> {
    if (!this.webAccess) return console.error('Web Access is disabled');
    const ofl = await fetchOflFixtureDirectory();
    ofl?.forEach(async (fixture) => {
      if (fixture.path !== 'manufacturers.json') {
        // Removing the .json from the end of the file
        const key = fixture.path.slice(0, -5);
        const item = this.fixtureIndex.getIndexItem(key);
        // If the SHA of the fixture doens't match, the index gets overwritten
        if (item?.sha !== fixture.sha) {
          this.fixtureIndex.setIndexItem(key, { sha: fixture.sha });
        }
      }
    });
    await this.saveIndex();
    return undefined;
  }

  /**
   * **ONLY** available when allowing web access usage.
   * Downloading the whole Open Fixture Library to the fixture index.
   * The Fixtureindex should, after a successfull download, have an additional ~30KB in size.
   */
  public async downloadOfl(): Promise<void> {
    if (!this.webAccess) return console.error('Web Access is disabled');
    const ofl = await fetchOflFixtureDirectory();
    if (!ofl) return undefined;
    ofl.forEach(async (fixture) => {
      if (fixture.path !== 'manufacturers.json') {
        // Removing the .json from the end of the file
        const key = fixture.path.slice(0, -5);
        const item = this.fixtureIndex.getIndexItem(key);
        // If the SHA of the fixture doens't match, the index gets overwritten
        if ((item?.path && item?.sha !== fixture.sha) || !item?.path) {
          // eslint-disable-next-line no-await-in-loop
          const file = await githubRawFixtureRequest(key) as Fixture;
          this.setFixture(key, file, fixture.sha, false, true);
        }
      }
    });
    await this.saveIndex();
    return undefined;
  }
}
