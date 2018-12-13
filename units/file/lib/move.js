const fse = require('fse');

module.export = {
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