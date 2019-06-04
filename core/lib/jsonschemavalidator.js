const _ = require('lodash');
const Ajv = require('ajv');

class JSONSchemaValidator {
  constructor(options) {
    options = _.defaults(options, {
      useDefaults: true,
    });
    this.ajv = new Ajv(options);
  }

  compile( schema ) {
    const validate = this.ajv.compile(schema);

    return (data, useDefaults) => {
      const dataCopy = JSON.parse(JSON.stringify(data));
      const isValid = validate(dataCopy);
      return {
        isValid,
        data: useDefaults ? dataCopy: data,
        errors: validate.errors,
      };  
    }
  }
}

module.exports = JSONSchemaValidator;