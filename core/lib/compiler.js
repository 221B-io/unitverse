compileUnit(unit, registry) {
  let command = null;
  if ( _.isString(unit.command) ) {
    console.log('in if', unit, registry)
    command = registry[unit.command];
  }else{
    command = unit.command;
  }
  const unitOptions = unit.options;
  const userInput = unit.input;
  let inputValidationFunction = undefined;
  
  if( unit.jsonSchema !== undefined) {
    const validator = this.validators.getLatest('jsonSchema');
    inputValidationFunction = validator.compile( unit.jsonSchema );
  }

  return (input, cb) => {
    const options = _.defaults(unitOptions, this.config);
    input = _.defaults(input, userInput);
    if( options.validateInput 
        && inputValidationFunction !== undefined ) {
      const validationObject =  inputValidationFunction ( input, options.useDefaults );
        return cb(validationObject.errors, null);
      }
      if( this.config.useDefaults === true) {
        input = validationObject.data;
      }
    }

    if( options.injectEngineAs ){
      input[options.injectEngineAs] = this;
    }

    if( options.injectRegistryAs ) {
      input[options.injectRegistryAs] = registry;
    }

    // return the callback version of the command
    this.callbackify(command, input, cb);
  };
}

compileArray(compiledArray) {
  return (input, callback) => {
    compiledArray.unshift((cb) => {
      cb(null, input);
    });
    return async.waterfall(compiledArray, callback);
  };
}

compileDependencies(dependencies) {
  const registry = {};
  _.forEach(dependencies, (value, key) => {
    if(_.isString(value)) {
      registry[key] = require(value);
    } else {
      console.log('Calling compile from compileDependencies')
      registry[key] = this.compile(value, registry);
    }
  });
  return registry;
}

compile( units, registry) {
  console.log('Compiling', units, registry)

  // function
  if( _.isFunction(units) ) {
    return units;
  }

  // a string and a registry
  if ( _.isString(units) && !_.isEmpty(registry)) {
    if(!_.has(registry, units) ){
      throw Error(`Registry does not have ${units}`);
    }
    return this.compileUnit(
      {
        command: registry[units],
      },
      registry
    );
  }
  
  // a unit
  if(_.isPlainObject(units) && _.has(units, 'command')) {
    let registry = {};
    if( _.has(units, 'dependencies')) {
      registry = this.compileDependencies(units.dependencies);
    }

    if(_.isFunction(units.command)) {
      return this.compileUnit(units, registry); // we need to inject the registry
    }

    if(_.isString(units.command) ){
      units.command = registry[units.command]; // swap out the string
      return this.compileUnit(units, registry); // for registry injection
    }
  }

  throw Error ('Not a recognized unit format');
}