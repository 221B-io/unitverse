const _ = require('lodash');
const async = require('async');

module.exports = {
  name: '@unitverse/collections/waterfall',
  command: (input, callback) => {
    const units = input.units;

    const engine = input._engine;
    const dependencies = input._dependencies;

    const compiledArray = _.map(units, (unit) => {
      return engine.compile(unit, dependencies);
    });

    if( compiledArray.length === 1) {
      return compiledArray[0];
    }

    delete input._engine;
    delete input._registry;

    compiledArray.unshift((cb) => {
      cb(null, input);
    });

    async.waterfall(compiledArray, callback);
  },
  options: {
    injectEngineAs: '_engine',
    injectDependenciesAs: '_dependencies',
  },
};