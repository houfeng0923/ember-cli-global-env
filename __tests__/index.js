const path = require('path');
const pluginTester = require('babel-plugin-tester').default;
const globalEnvPlugin = require('../lib/plugins/babel-plugin-replace-global-env');


pluginTester({
  plugin: globalEnvPlugin,
  // pluginOptions
  // tests
  fixtures: path.join(__dirname, 'fixtures'),
});

