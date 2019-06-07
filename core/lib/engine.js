const _ = require('lodash');
const npa = require('npm-package-arg');
const pino = require('pino');
const pIsPromise = require('p-is-promise');
const async = require('async');

const VersionedObject = require('./versionedobject');
const JSONSchemaValidator = require('./jsonschemavalidator');

class Engine {
  constructor(config) {
    this.config = _.defaults(config, {
      validateInput: true,
      useDefaults: true,
      compileValidationOnRegistration: false,
      log: false,
    });

    this.validators = new VersionedObject();
    this.validators.setVersion(
      'jsonSchema', 
      '0.1.0', 
      new JSONSchemaValidator(
        _.pick(this.config, ['useDefaults'])
      )
    );

    this.registry = {};

    this.logger = pino({ prettyPrint: { colorize: true } });
  }

  log(message, level) {
    if(this.config.log) {
      // level = _.defaultTo(level, 'info');
      // const levels = {
      //   trace: this.logger.trace,
      //   debug: this.logger.debug,
      //   info: this.logger.info,
      //   warn: this.logger.warn,
      //   error: this.logger.error,
      //   fatal: this.logger.fatal,
      // };
      // if(!_.has(levels, level)) {
      //   throw Error('Invalid log level');
      // }
      // levels[level](message);      
      this.logger.info(message);
    }
  }

  callbackify(command, input, callback) {
    let callbackWasRun = false;

    const composedCallback = (err, result) => {
      callbackWasRun = true;
      if ( !err ) {
        this.log({
          type: command.type,
          input: input,
          output: result,
        });
      }
      callback(err, result);
    }

    const calledCommand = command(input, composedCallback);
    if( callbackWasRun )
      return;
    
    if(pIsPromise(calledCommand)) {
      calledCommand.then((result) => {
        return composedCallback(null, result);
      }).catch((error) => {
        return composedCallback(error, null);
      });
    } else {
      return composedCallback(null, calledCommand);
    }
    return;
  }

  compileOne(unit) {
    let command = null;
    let inputValidationFunction = undefined;
    
    if(_.isPlainObject(unit)) {
      command = unit.command;
      if( unit.jsonSchema !== undefined) {
        const validator = this.validators.getLatest('jsonSchema');
        inputValidationFunction = validator.compile( unit.jsonSchema );
      }
    } else if (_.isFunction(unit) ){
      command = unit;
    } else {
      throw Error(`Unit is not of proper form`);
    }

    return (input, cb) => {
      // const options = _.defaults(options, this.config);
      const options = this.config;
      if( options.validateInput 
          && inputValidationFunction !== undefined ) {
        const validationObject =  inputValidationFunction ( input, options.useDefaults );
        if ( !validationObject.isValid ) {
          return cb(validationObject.errors, null);
        }
        if( this.config.useDefaults === true) {
          input = validationObject.data;
        }
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

  compile( units, registry ) {
    if(_.isPlainObject(units) && _.has(units, 'command')) {
      if(_.isFunction(units.command)) {
        return this.compileOne(units.command);
      }

      const registry = {};
      if( _.has(units, 'register')) {
        _.forEach(units.register, (value, key) => {
          if(_.isString(value)) {
            registry[key] = require(value);
          } else {
            registry[key] = this.compile(value);
          }
        });
      }
      if(_.isString(units.command) ){
        return this.compile(units.command, registry);
      }
      if(_.isArray(units.command) ) {
        return this.compile(units.command, registry);
      }
      return;  
    }

    if ( _.isArray(units) ) {
      const compiledArray = _.map(units, (unit) => {
        return this.compile(unit, registry);
      });
      
      if( compiledArray.length === 1) {
        return compiledArray[0];
      }
      return this.compileArray(compiledArray);
    }
    
    if ( _.isString(units) ) {
      return registry[units];
    }

    return;
  }
}

module.exports = Engine;