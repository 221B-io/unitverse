const shell = require('shelljs');

const argument = 'path';

const jsonSchema = {
  properties: {
    path: { type: "string" },
  },
  required: ['path'],
}

function init(input) {
  return new Promise((resolve, reject) => {
    shell.cd(input.path);
    shell.exec('npm init --force', { silent: true, });
    resolve(true);
  });
}

module.exports = {
  argument,
  jsonSchema,
  command: init,
};