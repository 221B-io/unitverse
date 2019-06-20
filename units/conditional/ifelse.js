module.exports = {
  name: '@unitverse/conditional/ifelse',
  command: (input, callback) => {
    const conditionIf = input.if;
    const conditionThen = input.then;
    const conditionElse = input.else;

    const engine = input._engine;
    const dependencies = input._dependencies;

    delete input._engine;
    delete input._registry;

    engine.run(conditionIf, input, dependencies, (err, result) => {
      if(result) {
        engine.run(conditionThen, input, dependencies, callback);
      } else {
        engine.run(conditionElse, input, dependencies, callback);
      }
    });
  },
  options: {
    injectEngineAs: '_engine',
    injectDependenciesAs: '_dependencies',
  },
};