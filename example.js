const Engine = require('./core/lib/engine');
const engine = new Engine({log: false});

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

const fn = engine.compile([
  callbackCommand1,
  callbackCommand5,
  callbackCommand5,
]);

fn({a:0}, (err, result) => {
  console.log(result);
});

[
  { command: callbackCommand1, options: { log: true }, },
  callbackCommand5,
  callbackCommand5,
]

{
  register: {
    'knex/init': require('./setupKnex'),
    getPasswordForUser: require('./getUserFromPassword'),
  },
  command: {
    unit: '@unitverse/collection/waterfall',
    input: {
      collection: [
        { unit: 'knex/init', input: {}, options: { runOnce: true,  },},
        { unit: 'getPasswordForUser', input: { username: 'USERNAME'}, options: { previous: 'knex', },},
        { unit: 'bcrypt/compare', input: { comparison: 'PASSWORD'}, options: { previous: 'hash' },},
      ],
    },
  },
}