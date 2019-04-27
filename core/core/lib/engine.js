const _ = require('lodash');
const npa = require('npm-package-arg');
const pino = require('pino');

const VersionedObject = require('./versionedobject');
const JSONSchemaValidator = require('./jsonschemavalidator');

class Engine {
  constructor(config) {
    this.config = _.defaults(config, {
      validate: true,
      compileValidationOnRegistration: false,
      log: false,
    });
    this.commandRegistry = new VersionedObject();
    this.validator = new JSONSchemaValidator();
    
    // Handle logger
    this.logger = null;
    if(this.config.log) {
      this.logger = pino({ prettyPrint: { colorize: true } });
    }
  }

  log(message) {
    if(this.config.log) {
      this.logger.info(message);
    }
  }

  // compile(name, version, jsonCommand) {
  //   _.each(jsonCommand.register, (value, key) => {
  //     this.register(key, value);
  //   });
  //   const command = this.commandRegistry.getLatest(jsonCommand.command.type);
  //   if(command === undefined) {
  //     assert new Error(`Unit ${name} may not be registered`);
  //   }
  //   return (input, cb) => {
  //     return 
  //   };
  // }

  register(name, command) {
    const parsed = npa(name);
    // if(_.isPlainObject(command.command)){

    // }
    this.commandRegistry.setVersion(parsed.name, parsed.rawSpec, command);
  }

  isCallback( callback ) {
    return callback !== undefined && typeof callback === 'function';
  }

  isPromise( result ) {
    return result !== undefined && result.then !== undefined && typeof result.then === 'function';
  }

  getSchema( name ) {
    const latestCommand = this.commandRegistry.getLatest(name);
    if( latestCommand.jsonSchema !== undefined ) {
      return latestCommand.jsonSchema;
    }
  }

  composeError(callback, error) {
    const expectsPromise = !this.isCallback(callback);
    if( expectsPromise ) {
      return new Promise((resolve, reject) => {
        reject(error);
      });
    } 
    callback(error, null);
    return;
  }

  expectedCallback(callback, command, input) {
    const calledCommand = command.command(input, callback, this);
    // Check to see if the function is a promise
    if(this.isPromise(calledCommand)) {
      calledCommand.then((result) => {
        this.log({
          type: command.type,
          input: input,
          output: result,
        });
        callback(null, result);
      }).catch((error) => {
        callback(error, null);
      });
    }
    return;
  }

  expectedPromise(command, input) {
    return new Promise((resolve, reject) => {
      // so we're using resolve as our callback
      // but we need to figure out if the function we're calling was a promise
      const calledCommand = command.command(input, (err, result) => {
        if ( err !== null ) {
          reject(err);
        }
        this.log({
          type: command.type,
          input: input,
          output: result,
        });
        resolve(result);
      }, this);
      if(this.isPromise(calledCommand)) {
        calledCommand.then((result) => {
          resolve(result);
        }).catch((error) => {
          reject(error);
        });
      }
      return;
    });
  }

  run(name, input, callback) {
    let validateFunction = () => { return true; }

    const command = this.commandRegistry.getLatest(name);
    if(command === undefined) {
      return this.composeError(callback, 
        new Error(`Unit ${name} may not be registered`));
    }

    command.type = name;

    if( !_.isPlainObject(input)) {
      if(command.argument === undefined) {
        return this.composeError(callback, 
          new Error('input is not an object and argument is not defined'));
      }
      const newInput = {};
      newInput[command.argument] = input;
      input = newInput;
    }

    if( command.validate === undefined ) {
      const version = this.commandRegistry.getLatestVersion(name);
      if( command.jsonSchema !== undefined ) {
        validateFunction = this.validator.compile(command.jsonSchema);
        // Adding a validate version as cache
        this.commandRegistry.data[name][version].validate = validateFunction;
      }
    } else {
      validateFunction = command.validate;
    }
    
    if( this.config.validate && !validateFunction(input) ) {
      // this.validator.errorsText()
      return this.composeError(callback, 
        new Error('Validation Error'));
    }

    // How do we return the error or result
    const expectsPromise = !this.isCallback(callback);
    // Called without a callback, so we're returning a promise
    if( expectsPromise ) {
      return this.expectedPromise(command, input);
    } 
    // Called with a callback
    return this.expectedCallback(callback, command, input);
  }
}

module.exports = Engine;