/**
import fsExtra from 'fs-extra';
import { LocalStorageFixtureIndex } from '../src';

const outputJSONSpy = jest.spyOn(fsExtra, 'outputJSON');
const readJSONSpy = jest.spyOn(fsExtra, 'readJSON');

describe('Testing StorageHandler', () => {
  const storage = new LocalStorageFixtureIndex();

  test('creation of file', async () => {
    const fileFlag = await storage.createFile('testfile.json', undefined, { test: 123 });
    expect(fileFlag).toBe(true);
    expect(outputJSONSpy).toHaveBeenCalledTimes(1);
  });

  test('creation of file in custom directory', async () => {
    outputJSONSpy.mockReset();
    const fileFlag = await storage.createFile('testfile.json', 'ofl', { test: 123 });
    expect(fileFlag).toBe(true);
    expect(outputJSONSpy).toHaveBeenCalledTimes(1);
  });
});
*/
