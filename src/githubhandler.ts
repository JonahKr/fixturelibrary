import fetch from 'node-fetch';
import { Fixture } from './types';
import { openFixtureLibraryVersion } from '../package.json';

interface GithubTag {
  name: string
  zipball_url?: string
  tarball_url?: string
  commit: {
    sha: string
    url: string
  }
  node_id?: string
}

interface GithubCommit {
  sha: string
  [key: string]: any
}

interface GithubTree {
  path: string
  mode: string
  type: 'blob' | 'tree' | 'commit'
  size?: number
  sha: string
  url: string
}

interface GithubTrees {
  sha: string
  url: string
  tree: GithubTree[]
  truncated: boolean
}

async function request(url: string): Promise<object | undefined> {
  return fetch(url).then(async (data) => {
    if (data.ok) {
      return data.json();
    }
    console.error(`${data.status} - ${data.statusText}`);
    return undefined;
  }).catch((err) => console.error(err));
}

async function githubRepositoryRequest(endpoint: string): Promise<object | any[] | undefined> {
  const url = `https://api.github.com/repos/OpenLightingProject/open-fixture-library/${endpoint}`;
  return request(url);
}

async function githubRawRequest(endpoint: string): Promise<object | undefined> {
  const url = `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/${endpoint}`;
  return request(url);
}

function extractTagVersion(tag: GithubTag): string {
  return tag.name.split('-')[1];
}

let latestCommit: string | undefined;

export async function fetchLatestSupportedCommit(forceUpdate = false): Promise<string | undefined> {
  if (latestCommit && !forceUpdate) return latestCommit;
  const tagReq = await githubRepositoryRequest('tags') as GithubTag[] | undefined;
  if (!tagReq) return undefined;
  const version = extractTagVersion(tagReq[0]);

  if (version === openFixtureLibraryVersion) {
    // If its equal to the latest supported version, we just fetch the latest commit
    const latestCommitReq = await githubRepositoryRequest('commits/master') as GithubCommit;
    latestCommit = latestCommitReq.sha;
  } else {
    // Otherwise we just return the sha of the supported version tag.
    // We cannot use a more recent one since commits can have multiple parents. (Backtracing)
    latestCommit = tagReq[0].commit.sha;
  }
  return latestCommit;
}

export class TruncatedDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TruncatedDataError';
  }
}

/**
 * @internal
 * Fetching and filtering a list of all fixtures of ofl.
 * @returns List of all fixtures in the Open Fixture Library
 * @throws TruncatedDataError if the list is to long
 */
export async function fetchOflFixtureDirectory():
Promise<{ path: string, sha: string }[] | undefined> {
  // At first we get the tree sha for the fixtures directory in the latest supported commit
  const latComm = await fetchLatestSupportedCommit();
  if (!latComm) return undefined;
  const dirReq = await githubRepositoryRequest(`git/trees/${latComm}`) as GithubTrees;
  const fixturesDirSha = dirReq.tree.filter((e) => (e.path.startsWith('fixtures') && e.type === 'tree'))[0].sha;
  // Now we can continue with the sub-tree
  const fixtReq = await githubRepositoryRequest(`git/trees/${fixturesDirSha}?recursive=1`) as GithubTrees;
  // Before we continue we need to check if the data got truncated
  if (fixtReq.truncated) throw new TruncatedDataError('The Open Fixture Library got to big. Please resort to specific File downloading!');

  const fixtures: { path: string, sha: string }[] = [];
  fixtReq.tree.forEach((e) => {
    // Filtering out directories or commits from the tree
    if (e.type !== 'blob') return;
    fixtures.push({ path: e.path, sha: e.sha });
  });
  return fixtures;
}

/**
 * Downloading a specific fixture:
 * @param path fixture path to download
 * @returns Fixture Definition
 */
export async function fetchOflFixture(path: string): Promise<Fixture | undefined> {
  let corrPath = path;
  if (!path.endsWith('.json')) {
    corrPath = `${path}.json`;
  }
  const latComm = await fetchLatestSupportedCommit();
  if (!latComm) return undefined;
  return await githubRawRequest(`${latComm}/fixtures/${corrPath}`) as Fixture;
}
