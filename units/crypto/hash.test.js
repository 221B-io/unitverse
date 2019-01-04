const Engine = require('../../core/core/lib/engine');
const hash = require('./hash');

const engine = new Engine();

engine.register('hash', '0.1.0', hash);

describe('Hash', () => {
  test('hash', () => {
    engine.run('hash', {
      path: 'package.json',
    }, (err, result) => {
      console.log(result);
      expect(result).not.toBeNull();
    });
  });
});