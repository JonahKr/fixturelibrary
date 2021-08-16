import fetch from 'node-fetch';
import { Fixture } from 'types/fixture';
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

async function request(url: string): Promise<any> {
  return fetch(url).then((res) => res.json()).catch((err) => console.error(err));
}

async function githubRepositoryRequest(endpoint: string): Promise<any> {
  const url = `https://api.github.com/repos/OpenLightingProject/open-fixture-library/${endpoint}`;
  return request(url);
}

async function githubRawRequest(endpoint: string): Promise<any> {
  const url = `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/${endpoint}`;
  return request(url);
}

function extractTagVersion(tag: GithubTag): string {
  return tag.name.split('-')[1];
}

let latestCommit: string | undefined;

export async function fetchLatestSupportedCommit(forceUpdate = false): Promise<string> {
  if (latestCommit && !forceUpdate) return latestCommit;
  const tagReq: GithubTag[] = await githubRepositoryRequest('tags');
  const version = extractTagVersion(tagReq[0]);

  if (version === openFixtureLibraryVersion) {
    // If its equal to the latest supported version, we just fetch the latest commit
    const latestCommitReq: GithubCommit = await githubRepositoryRequest('commits/master');
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

export async function fetchOFLFixtureDirectory(): Promise<any> {
  // At first we get the tree sha for the fixtures directory
  const dirReq: GithubTrees = await githubRepositoryRequest(`git/trees/${await fetchLatestSupportedCommit()}`);
  const fixturesDirSha = dirReq.tree.filter((e) => (e.path.startsWith('fixtures') && e.type === 'tree'))[0].sha;
  // Now we can continue with the sub-tree
  const fixtReq: GithubTrees = await githubRepositoryRequest(`git/trees/${fixturesDirSha}?recursive=1`);
  // Before we continue we need to check if the data got truncated
  if (fixtReq.truncated) throw new TruncatedDataError('The Open Fixture Library got to big. Please resort to specific File downloading!');

  const fixtures: any[] = [];
  fixtReq.tree.forEach((e) => {
    // Filtering out directories or commits from the tree
    if (e.type !== 'blob') return;
    fixtures.push({ path: e.path, sha: e.sha });
  });
  return fixtures;
}

export async function fetchOFLFixture(path: string): Promise<Fixture> {
  let corrPath = path;
  if (!path.endsWith('.json')) {
    corrPath = `${path}.json`;
  }
  return await githubRawRequest(`${await fetchLatestSupportedCommit()}/fixtures/${corrPath}`) as Fixture;
}
