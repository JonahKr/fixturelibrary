/**
 * This is for creating a Reference Free Version of the OFL Schema.
 */
const $RefParser = require('@apidevtools/json-schema-ref-parser')
const writeJson = require('fs-extra').writeJSON;

const path = './open-fixture-library/schemas/fixture.json'

async function dereference() {
  const parser = new $RefParser();
  const bundle = await parser.dereference(path);

  await writeJson('../src/ofl-schema/ofl-fixture.json', bundle);
}
dereference();
