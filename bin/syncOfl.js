#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable consistent-return */

const fetch = require('node-fetch');
const { FixtureLibrary } = require('../dist/src/fixturelibrary');

// If all files should be downloaded
let deepSync = true;

if (process.argv[3] === 'shallow') {
  deepSync = false;
}

const fl = new FixtureLibrary(true);

async function main() {
  // Now we check if github is live
  const response = await fetch('https://github.com/status');
  if (!response.ok) return console.error('Github is currently not available. Please check your internet connection.');
  console.log('Starting OpenFixtureLibrary Synchronization.');
  let updates;
  if (deepSync) {
    updates = await fl.downloadOfl();
  } else {
    updates = await fl.fetchOfl();
  }
  const length = updates ? updates.length : 0;
  console.log(`Applied ${length} Update${length === 1 ? '' : 's'}!`);
  console.log('Finished OpenFixtureLibrary Synchronization.');
}

main();
