# Unitverse

## Not on NPM yet, however...
```
npm -g lerna
git clone https://github.com/221B-io/unitverse
npm run bootstrap
npm run link
cd ..
mkdir test-unitverse && cd test-unitverse
npm init
npm i @unitverse/core @unitverse/tasks @unitverse/crypto
touch index.js
```

Copy and paste some of the code below into index.js and run

```
node index.js
```

## Getting Started
```
const Engine = require('unitverse');
const engine = new Engine();

engine.register('tasks', '0.1.0', require('@unitverse/tasks/tasks'));
engine.register('hash', '0.1.0', require('@unitverse/crypto/hash'));

engine.run('tasks', {
  tasks: [{
    'hash': {
      path: 'touch.txt',
      function: 'md5',
    },
  },],
  log: false,
}).then((result) => {
  console.log('result', result);
}).catch((error) => {
  console.log(error);
});
```

## The `run` function

The run function can take a callback or return a promise, depending on whether or not callback is a function. For example, using the callback notation:

```
engine.run('hash', {
  path: 'touch.txt',
  function: 'md5',
}, (err, result,) => {
  console.log('result', result);
})
```

and Promise notation:

```
engine.run('hash', {
  path: 'touch.txt',
  function: 'md5',
}).then((result) => {
  console.log('promise', result);
});
```