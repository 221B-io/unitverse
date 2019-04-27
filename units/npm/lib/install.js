const shell = require('shelljs');

const argument = 'path';

const jsonSchema = {
  properties: {
    path: { type: "string" },
    package: { type: "string" },
  },
  required: ['path'],
}

function install(input) {
  return new Promise((resolve, reject) => {
    shell.cd(input.path);
    const result = shell.exec(`npm install ${input.package}`, { silent: true, });
    const matches = /\+ (?<package>.+)@(?<version>.+)\s.*/g.exec(result.stdout);
    resolve(matches.groups.package);
  });
}

module.exports = {
  argument,
  jsonSchema,
  command: install,
};