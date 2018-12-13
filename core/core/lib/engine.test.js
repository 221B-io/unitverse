const Engine = require('./engine');

const engine = new Engine();

const callbackCommand = {
  command: (input, cb) => {
    cb(null, true);
  }
}

const promiseCommand = {
  command: (input) => {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }
}

const validateCommand = {
  jsonSchema: {
    properties: {
      a: { type: 'string', },
    },
  },
  command: (input, cb) => {
    cb(null, true);
  },
}

engine.register('callbackCommand', '0.1.0', callbackCommand);
engine.register('promiseCommand', '0.1.0', promiseCommand);
engine.register('validateCommand', '0.1.0', validateCommand);

describe('Validate', () => {
  test('validate', () => {
    engine.run('validateCommand', {
      a: 1,
    }, (err, result) => {
      expect(err).not.toBeNull();
    });
  });
})

describe('Using a callback', () => {
  test('With a callback command', () => {
    engine.run('callbackCommand', {}, (err, result) => {
      expect(result).toBe(true);
    });
  });
  test('With a promise command', () => {
    engine.run('promiseCommand', {}, (err, result) => {
      expect(result).toBe(true);
    });
  });
});

describe('Using a promise', () => {
  test('With a callback command', () => {
    engine.run('callbackCommand', {}).then((result) => {
      expect(result).toBe(true);
    });
  });
  test('With a promise command', () => {
    engine.run('promiseCommand', {}).then((result) => {
      expect(result).toBe(true);
    });
  });
});