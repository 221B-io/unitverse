'use strict';

const argument = 'message';

const command = (options, callback, engine) => {
  engine.log(options.message);
  callback(null, options.message);
};

module.exports = {
  argument,
  command,
}