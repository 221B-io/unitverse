const _ = require('lodash');
const Ajv = require('ajv');

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

module.exports = JSONSchemaValidator;