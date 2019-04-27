'use strict';

const _ = require('lodash');

const defaultOptions = { 
  interpolate: /\${([\s\S]+?)}/g, // ${variable}
};

const argument = 'template';

const jsonSchema = {
  properties: {
    "template": {
      type: "string",
    },
    "data": {
      type: "object",
    },
  },
  required: ["template"],
}

function command(options, cb) {
  // TODO merge defaultOptions and options
  // TODO this doesn't need to use a callback or promise
  const template = _.template(options.template, defaultOptions);
  if(options.data === undefined) {
    // TODO cache on the engine (third argument)
    cb(null, template);
  }
  cb(null, template(options.data));
}

module.exports = {
  argument,
  jsonSchema,
  command,
};