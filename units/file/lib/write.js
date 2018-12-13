const _ = require('lodash');
const fs = require('fs');
const flatted = require('flatted');

const jsonSchema = {
  schema: {
    properties: {
      path: { type: "string", },
      content: { },
      append: { 
        type: "boolean", 
        default: false,
      },
      stringify: {
        type: "boolean",
        default: true,
      },
    },
    required: ["tasks"],
  },
}

module.exports = {
  argument: 'path',
  jsonSchema,
  command: (input, cb) => {
    let content = input.content;
    if( _.isArray(content) || _.isPlainObject(content) ) {
      if( input.stringify === true ) {
        content = flatted.stringify(content);
      }
    }
    fs.writeFile(input.path, content, {
      flag: input.append ? 'a' : 'w',
    }, () => cb(null, input.path));
  },
};