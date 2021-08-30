const Ajv = require('ajv');
const addFormats = require('ajv-formats')

const ajv = new Ajv({
  verbose: true,
  strict: false,
  allErrors: true,
  discriminator: true,
  addUsedSchema: false
});
addFormats(ajv);
ajv.addKeyword(`version`);
ajv.addFormat(`color-hex`, true);

const schema = require('../src/ofl-schema/ofl-fixture.json');

const data = require('./open-fixture-library/fixtures/adb/alc4.json');

const valid = ajv.validate(schema, data);
if (!valid) console.log(validator.errors)
