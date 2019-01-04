const fse = require('fse');

module.exports = {
  jsonSchema: {
    properties: {
      source: {

      },
      destination: {

      },
    },
  },
  command: async (options, cb) => {
    await fse.move(options.source, options.destination);
    cb(null, options.destination);
  },
}