const async = require('async');

const jsonSchema = {
  properties: {
    collection: { type: ["array", "object"] },
    unit: { type: "string" },
    limit: { 
      type: "integer",
    },
  },
  required: ["collection", "unit"],
};

const command = (input, cb, engine) => {
  if(input.limit===undefined) {
    return async.map(input.collection, async (value, index, collection) => {
      return engine.run(input.unit, value);
    }, cb);
  }
  return async.mapLimit(input.collection, input.limit, async (value, index, collection) => {
    return engine.run(input.unit, value);
  }, cb);
}

module.exports = {
  jsonSchema,
  command,
}