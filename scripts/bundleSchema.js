/**
 * This is for creating a Reference Free Version of the OFL Schema.
 */
const $RefParser = require('@apidevtools/json-schema-ref-parser')
const writeJson = require('fs-extra').writeJSON;

const path = './open-fixture-library/schemas/fixture.json'

/**
 * Recursively removing all $id tags from an object
 * @param {*} object
 * @returns cleaned object
 */
function removeId(object) {
  Object.keys(object).forEach((e)=>{
    if (e === '$id') delete object['$id']
    if (object[e] instanceof Object) object[e] = removeId(object[e]);
  })
  return object;
}

async function bundle() {
  const parser = new $RefParser();
  let bundle = await parser.bundle(path);

  // We need to remove the $id tags aswell to prevent
  bundle = removeId(bundle);

  await writeJson('../src/ofl-schema/ofl-fixture.json', bundle);
}
dereference();
