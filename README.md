# !! Deprecated !! This was just a hacky way to work with the open-fixture-library 

# FixtureLibrary JS / TS

The JS/TS library for working with the [open-fixture-library](https://github.com/OpenLightingProject/open-fixture-library).

The Documentation can be found [here](https://jonahkr.github.io/fixturelibrary)


# Installation

Via NPM: `npm i fixturelibrary && npx syncOfl`

`syncOfl` executes a Script which then downloads all fixture definitions into the `.fixturelibrary` directory and populates an index with path and sha version references. If you don't want all fixtures downloaded and are fine with downloading them during runtime you can use the `shallow` parameter : `npx syncOfl shallow`

**When new fixtures get added to the Open-Fixture-Library just run `npx syncOfl` to update your index!**
If his script is executed to often, you might run into the Github rate limiter and you'll have to try again after you wait some time.

# Usage

For a more in depth documentation please look here: [`FixtureLibrary`](https://jonahkr.github.io/fixturelibrary/classes/FixtureLibrary.html)

```js
const { FixtureLibrary } = require('fixturelibrary');
const fl = new FixtureLibrary();

const fixture = await fl.getFixture('cameo/auro-spot-300');
console.log(`${fixture.name} has ${fixture.modes.length} Modes.`);
```

When working with **Typescript**, types for the fixture and all different capabilities can be found [here](https://jonahkr.github.io/fixturelibrary/modules/Types.html).
