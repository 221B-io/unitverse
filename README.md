# Unitverse

## Getting Started
```
const uv = require('unitverse');
const engine = new uv.Engine();

const unit = {
  register: {
    hash: require('@unitverse/crypto/hash'));
  },
  command: [
    'hash',
  ])
};

const fn = engine.compile(unit);
fn('readme.txt', (err, result) => console.log(result))
```

## Units

Units are objects with the following keys: 
- dependencies (optional)
- command (required) 
- name (optional)
- version (optional)
- description (optional)
- jsonSchema (optional)

### Dependencies

Unit dependencies map strings that can be used as part of a command to JavaScript packages that can be required in typical JavaScript fashion (e.g., ```npm install```, ```yarn add```).

### Command

Command can take the following forms:

- A string referring to a registered dependency
- A Unit object
- A JavaScript function with one argument and an option callback. The function should return a value syncronously, return a Promise, or call the callback.
- A 

- An array of any of the above items (includings arrays of arrays of items)

Compilnig the unit of any of the above forms will generate a single function of the form:

```
(input, callback) => {
  ...
}
```

When a unit's command contains an array of other units, input "waterfalls" through the array (or arrys of arrys) by default.

Input to ```engine.compile``` can take the same form 

- engine
- runOptions
- cache

## 

## Internal docs...
```
npm -g lerna
git clone https://github.com/221B-io/unitverse
npm run bootstrap
npm run link
cd ..
mkdir test-unitverse && cd test-unitverse
npm init
npm link @unitverse/core @unitverse/collections @unitverse/crypto
touch index.js
```

Copy and paste some of the code below into index.js and run

```
node index.js
```