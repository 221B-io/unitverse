const _ = require('lodash');
const npa = require('npm-package-arg');
const pino = require('pino');
const pIsPromise = require('p-is-promise');

const waterfall = require('../../units/collections/waterfall');

const VersionedObject = require('./versionedobject');
const JSONSchemaValidator = require('./jsonschemavalidator');

class Engine {
  constructor(config) {
    this.config = _.defaults(config, {
      validateInput: true,
      useDefaults: true,
      // compileValidationOnRegistration: false,
      log: false,
      arrayProcessor: waterfall,
      injectDependenciesAs: null,
      injectEngineAs: null,
    });

    this.validators = new VersionedObject();
    this.validators.setVersion(
      'jsonSchema', 
      '0.1.0', 
      new JSONSchemaValidator(
        _.pick(this.config, ['useDefaults'])
      )
    );

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
      // if ( !err ) {
      //   this.log({
      //     type: command.type,
      //     input: input,
      //     output: result,
      //   });
      // }
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

  run( value, input, dependencies, cb) {
    if(_.isPlainObject(value)) {
      input = _.defaults(value.input, input);
      const injectEngineAs = _.get(value, 'options.injectEngineAs');
      if(injectEngineAs){
        input[injectEngineAs] = this;
      }
      const injectDependenciesAs = _.get(value, 'options.injectDependenciesAs');
      if(injectDependenciesAs) {
        input[injectDependenciesAs] = dependencies;
      }

      if(_.isString(value.command)) {
        return this.run(
          value.dependencies[value.command],
          input,
          value.dependencies, // forward dependencies through
          cb
        );
      }
      
      if(_.isFunction(value.command)) {
        return this.run(value.command, input, null, cb);
      }

      if(_.isPlainObject(value.command)) {
        return this.run(value.command, input, value.dependencies, cb);
      }
      
      if(_.isArray(value.command)) {
        value.input = {
          units: value.command,
        };
        value.command = _.get(value, 'options.arrayProcessor') || this.config.arrayProcessor;
        return this.run(value, input, value.dependencies, cb);
      }
    }

    if(_.isString(value)) {
      return this.run(
        dependencies[value],
        input,
        null,
        cb
      )
    }

    if(_.isFunction(value)) {
      this.callbackify(value, input, cb);
    }
  }

  compile(value, dependencies) {
    return (input, cb) => {
      this.run(value, input, dependencies, cb);
    };
  }
}

module.exports = Engine;