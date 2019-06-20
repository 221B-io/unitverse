const Engine = require('./core/lib/engine');
const engine = new Engine({log: false});
const waterfall = require('./units/collections/waterfall');

const callbackCommand1 = {
  name: 'callbackCommand1',
  command: (input, cb) => {
    cb(null, { a: input.a+1 });
  },
};

const callbackCommand2 = {
  name: 'callbackCommand2',
  command: (input, cb) => {
    cb(null, { a: input.a+10 });
  },
};

const unit1 = {
  name: 'example2',
  dependencies: {
    callbackCommand1,
    callbackCommand2,
    waterfall,
  },
  command: [ 'callbackCommand1', 'callbackCommand2' ] 
};

const unit2 = {
  name: 'example3',
  dependencies: {
    ifelse: require('./units/conditional/ifelse'),
    callbackCommand1,
    callbackCommand2,
  },
  command: 'ifelse',
  input: { 
    if: () => false,
    then: callbackCommand2,
    else: callbackCommand1,
  },
}

const fn = engine.compile(unit2);

fn({a:0}, (err, result) => {
  console.log('Result', result);
});


// const json = {
//   dependencies: {
//     map: '@unitverse/collections/map',
//   },
//   command: {
//     unit: 'map',
//     input: {
//       collection: [
//         { unit: }
//       ],
//     },
//     options: {
//       injectEngine: 'engine',
//     },
//   },
// };