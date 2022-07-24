import {
  outputJSON, pathExists, readJSON,
} from 'fs-extra';

import { ItemExistanceError } from './fixtureindex';

export const storageDirectory = './.fixturelibrary';

export async function readJsonFile(filename: string): Promise<any> {
  // Preparing path
  let path = `${storageDirectory}/${filename}`;
  if (!filename.endsWith('.json')) path += '.json';
  // Checking if file exists
  if (!await pathExists(path)) {
    throw new ItemExistanceError(`${path} doesn't exist!`);
  }
  try {
    return await readJSON(path);
  } catch (err) {
    console.error(err);
  }
  return undefined;
}

export async function writeJsonFile(name: string, data: {} | [], override = false):
Promise<boolean> {
  // Preparing path
  let path = `${storageDirectory}/${name}`;
  if (!path.endsWith('.json')) path += '.json';
  // Checking if file already exists
  if (!override && await pathExists(path)) {
    throw new ItemExistanceError(`This file at ${path} already exist!`);
  }
  try {
    await outputJSON(path, data);
  } catch (err) {
    console.error(err);
    return false;
  }
  return true;
}
