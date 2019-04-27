module.exports = {
  register: {
    '@unitverse/hash@0.1.0': require('../crypto/hash'),
  },
  command: {
    type: '@unitverse/hash@0.1.0',
    algorithm: 'md5'
  },
};