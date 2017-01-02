const assert = require('chai').assert,
  CLIEngine = require("eslint").CLIEngine,
  path = require("path"),
  plugin = require("..");




describe('eslint-plugin-done-component', () => {
  let cli;

  before(() => {
    cli = new CLIEngine({
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
      },
      extensions: ['component'],
      ignore: false,
      useEslintrc: false,
      rules: {
        'eol-last': 2,
        'no-console': 2,
        'quotes': ['error', 'single']
      }
    });

    cli.addPlugin('done-component', plugin);
  });

  it('should run on .component files', () => {
    const results = cli.executeOnFiles([path.join(__dirname, 'fixtures', 'sample.component')]).results;

    assert.equal(results.length, 1);
    assert.equal(results[0].messages.length, 2);
    assert.equal(results[0].messages[0].message, 'Strings must use singlequote.');
    assert.equal(results[0].messages[0].line, 22);
  });
});