const fs = require('fs');

function async list(path, cb) {
  fs.readdir(options.path, (err, files) => {
    cb(null, files);
  })
}

module.exports = {
  jsonSchema: {
    properties: {
    },
  },
  command: async (options, cb) => {
    list(options.path, cb);
  },
}