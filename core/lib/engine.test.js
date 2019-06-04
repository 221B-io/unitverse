const Engine = require('./engine');

const engine = new Engine({log: false});

const callbackCommand = {
  command: (input, cb) => {
    cb(null, input);
  },
};

const promiseCommand = {
  command: (input) => {
    return new Promise((resolve, reject) => {
      resolve(input);
    });
  },
};

const valueCommand = {
  command: (input) => {
    return input;
  },
};

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

describe( 'Test compiling invidual units', () => {
  test('With a callback command',  () => {
    const fn = engine.compileOne(callbackCommand);
    fn({ a: 1, b: 2}, (err, result) => {
      expect(result).toEqual({ a: 1, b: 2});
    });
  });

  test('With a promise', () => {
    const fn = engine.compileOne(promiseCommand);
    fn({ a: 1, b: 2}, (err, result) => {
      expect(result).toEqual({ a: 1, b: 2});
    });
  });

  test('With a value', () => {
    const fn = engine.compileOne(valueCommand);
    fn({ a: 1, b: 2}, (err, result) => {
      expect(result).toEqual({ a: 1, b: 2});
    });
  });

  test('Callback with validation', () => {
    const fn = engine.compileOne(validateCommand);
    fn({ a: '1' }, (err, result) => {
      expect(err).toBeNull();
      expect(result).toBe('1');
    });
  });

  test('Callback with validation error', () => {
    const fn = engine.compileOne(validateCommand);
    fn({ a: 1 }, (err, result) => {
      expect(err).not.toBeNull();
    });
  });

  test('Validate with a default value', () => {
    const fn = engine.compileOne(validateCommandWithDefaults);
    fn({}, (err, result) => {
      expect(err).toBeNull();
      expect(result).toBe('the_default_value');
    });
  });

  test('Validate with an overlapping of default value', () => {
    const fn = engine.compileOne(validateCommandWithDefaults);
    fn({a: 'overwriting_default'}, (err, result) => {
      expect(err).toBeNull();
      expect(result).not.toBe('the_default_value');
      expect(result).toBe('overwriting_default');
    });
  });
});

const callbackCommand1 = {
  command: (input, cb) => {
    cb(null, { a: input.a+1 });
  },
};

const callbackCommand2 = {
  command: (input, cb) => {
    cb(null, { a: input.a+10 });
  },
};

const callbackCommand3 = {
  register: {
    command2: callbackCommand2,
  },
  command: [
    'command2',
  ],
};

const callbackCommand4 = {
  register: {
    command3: callbackCommand3,
  },
  command: [
    'command3',
  ],
};

const callbackCommand5 = {
  register: {
    command1: callbackCommand1,
    command4: callbackCommand4,
  },
  command: [
    'command1',
    'command4',
  ],
};

describe( 'Test compiling units', () => {
  test('Basic',  () => {
    const fn = engine.compile([
      callbackCommand1,
      callbackCommand5,
    ]);
    fn({a:0}, (err, result) => {
      // expect(err).tobeNull();
      expect(result).toEqual({ a: 12, });
    });
  });
});