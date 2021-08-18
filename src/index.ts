/* eslint-disable @typescript-eslint/no-unused-vars */
import * as types from './types';

/**
 * Type definitions for the Open Fixture Library fixture schema.
 *
 * Most important types:
 * - Fixture: {@link Fixture}
 * - Capabilities: {@link Capabilities}
 */
export import Types = types;

export { FixtureIndex, IndexItem } from './fixtureindex';
export { LocalStorageFixtureIndex } from './localstoragefixtureindex';

export { TruncatedDataError, fetchOFLFixtureDirectory, fetchOFLFixture } from './githubhandler';
