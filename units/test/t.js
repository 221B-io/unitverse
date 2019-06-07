module.exports = {
  register: {
    '@unitverse/hash@0.1.0': require('../crypto/hash'),
  },
  command: {
    type: '@unitverse/hash@0.1.0',
    algorithm: 'md5'
  },
};

const {setInput, ifFalseStop} = require('@unitverse/core')
const template = require('@unitverse/')

module.exports = {
  register: {
    'hash': require('../crypto/hash'),
  },
  command: {
    type: 'hash',
    algorithm: 'md5'
  },
};

[
  'setInput', { email: 'jspies@gmail.com'}, {},
  'checkEmailInDatabase', {}, { 'forwardInput': true, 'mapOutput': 'test' },
  'ifFalseStop', {}, { 'forwardInput': true },
  'template', { }
]