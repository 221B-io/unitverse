const Engine = require('../../../core/core/lib/engine');
const lodashTemplate = require('./lodash');

const engine = new Engine();

engine.register('@unitverse/lo@0.1.0', lodashTemplate);

describe('Template - lodash', () => {
  test('Function', async () => {
    const templateFunction = await engine.run('@unitverse/lo', {
      template: 'Hello ${name}',
    });
    const result = templateFunction({
      name: 'world',
    });
    expect(result).toBe('Hello world');
  });

  test('Function with data', async() => {
    const result = await engine.run('@unitverse/lo', {
      template: 'Hello ${name}',
      data: {
        name: 'world',
      },
    });
    expect(result).toBe('Hello world');
  });
});