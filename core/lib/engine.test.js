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
    cb(null, input.a);
  },
}

const validateCommandWithDefaults = { 
  jsonSchema: {
    properties: {
      a: { 
        type: 'string', 
        default: 'the_default_value',
      },
    },
  },
  command: (input, cb) => {
    cb(null, input.a);
  },
}

engine.register('callbackCommand@0.1.0', callbackCommand);
engine.register('promiseCommand@0.1.0', promiseCommand);
engine.register('validateCommand@0.1.0', validateCommand);
engine.register('validateCommandWithDefaults@0.1.0', validateCommandWithDefaults);

describe('Validate', () => {
  test('validate', () => {
    engine.run('validateCommand', {
      a: '1',
    }, (err, result) => {
      expect(result).toBe('1');
    });
  });

  test('validate error', () => {
    engine.run('validateCommand', {
      a: 1,
    }, (err, result) => {
      expect(err).not.toBeNull();
    });
  });

  test('validate with a default value', () => {
    engine.run('validateCommandWithDefaults', {
    }, (err, result) => {
      expect(err).toBeNull();
      expect(result).toBe('the_default_value');
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