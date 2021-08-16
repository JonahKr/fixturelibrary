import fsExtra from 'fs-extra';
import { StorageHandler } from '../src';

const ensureDirSpy = jest.spyOn(fsExtra, 'ensureDir');
const outputJSONSpy = jest.spyOn(fsExtra, 'outputJSON');
const readJSONSpy = jest.spyOn(fsExtra, 'readJSON');

describe('Testing StorageHandler', () => {
  const storage = new StorageHandler();

  test('wether standard directories got created', async () => {
    await storage.setup();
    expect(ensureDirSpy).toHaveBeenCalledTimes(3);
  });

  test('create directory ', async () => {
    const dirFlag1 = await storage.createDirectory('examplename');
    expect(dirFlag1).toBe(true);
  });

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

  test('read file', async () => {
    const filecontent = await storage.readFile(`${storage.storageDirectory}/testfile.json`);
    expect(filecontent.toString()).toBe({ test: 123 }.toString());
    expect(readJSONSpy).toHaveBeenCalledTimes(1);
  });
});
