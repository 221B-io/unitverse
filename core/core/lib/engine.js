const _ = require('lodash');
const Ajv = require('ajv');

class VersionedObject {
  constructor() {
    this.data = {};
    this.latestData = {};
    this.latestVersions = {};
  }

  getLatest(label) {
    return this.latestData[label];
  }

  getVersion(label, version) {
    return this.data[label][version];
  }

  getLatestVersion(label) {
    return this.latestVersions[label];
  }

  setVersion(label, version, value) {
    if( this.data[label] === undefined ) {
      this.data[label] = {};
      this.latestData[label] = value;
      this.latestVersions[label] = version;
    }
    this.data[label][version] = value;
  }

  setLatest(label, version) {
    this.latestData[label] = this.data[label][version];
    this.latestVersions[label] = version;
  }
}

class JSONSchemaValidator {
  constructor(config) {
    config = _.defaults(config, {
      useDefaults: true,
    });
    this.ajv = new Ajv({
      useDefaults: config.useDefaults, 
    });
  }

  compile(schema) {
    return this.ajv.compile(schema);
  }
  
  errorsText() {
    return this.ajv.errorsText();
  }
}

class Engine {
  constructor(config) {
    this.config = _.defaults(config, {
      validate: true,
      compileValidationOnRegistration: false,
    });
    this.commandRegistry = new VersionedObject();
    this.validator = new JSONSchemaValidator();
  }

  register(name, version, command) {
    this.commandRegistry.setVersion(name, version, command);
  }

  isCallback( callback ) {
    return callback !== undefined && typeof callback === 'function';
  }

  isPromise( result ) {
    return result !== undefined && result.then !== undefined && typeof result.then === 'function';
  }

  getSchema( name ) {
    const latestCommand = this.commandRegistry.getLatest(name);
    console.log(latestCommand);
    if( latestCommand.jsonSchema !== undefined ) {
      return latestCommand.jsonSchema;
    }
  }

  run(name, input, callback) {
    let error = null;
    const latestCommand = this.commandRegistry.getLatest(name);
    let validateFunction = () => { return true; }
    if( latestCommand.validate === undefined ) {
      const version = this.commandRegistry.getLatestVersion(name);
      if( latestCommand.jsonSchema !== undefined ) {
        validateFunction = this.validator.compile(latestCommand.jsonSchema);
        // Adding a validate version as cache
        this.commandRegistry.data[name][version].validate = validateFunction;
      }
    } else {
      validateFunction = latestCommand.validate;
    }

    if( this.config.validate && !validateFunction(input) ) {
      // this.validator.errorsText()
      error = new Error('Validation Error');
    }
    
    if(!_.isPlainObject(input)) {
      if(latestCommand.argument === undefined) {
        error = new Error('input is not an object and argument is not defined');
      }
      const newInput = {};
      newInput[latestCommand.argument] = input;
      input = newInput;
    }

    const expectsPromise = !this.isCallback(callback);

    // Called without a callback, so we're returning a promise
    if( expectsPromise ) {
      if( error !== null) {
        return new Promise((resolve, reject) => {
          reject(error);
        });
      }
      return new Promise((resolve, reject) => {
        // so we're using resolve as our callback
        // but we need to figure out if the function we're calling was a promise
        const calledCommand = latestCommand.command(input, (err, result) => {
          if ( err !== null ) {
            reject(err);
          }
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

    // Called with a callback
    if( error !== null) {
      callback(error, null);
      return;
    }
    const calledCommand = latestCommand.command(input, callback, this);
    // Check to see if the function is a promise
    if(this.isPromise(calledCommand)) {
      calledCommand.then((result) => {
        callback(null, result);
      }).catch((error) => {
        callback(error, null);
      });
      
    }
    return;
  }
}

module.exports = Engine;