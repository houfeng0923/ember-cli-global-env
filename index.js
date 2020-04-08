// TODO (2020/03/22 12:29)  typescript support

const fs = require('fs');
const path = require('path');
const { hasPlugin, addPlugin } = require('ember-cli-babel-plugin-helpers');

module.exports = {
  name: require('./package').name,
  isDevelopingAddon() {
    return false;
  },

  setupPreprocessorRegistry(type, registry) {
    if (type !== 'parent') return;
    this.app = this._findHost();
    const options = Object.assign({
      helperName: 'env',
      importPath: '@global/env',
    },this.app.options['global-env']);
    const globalEnv = this.createEnv(this.app.env, this.app.project);

    this.addBabelPluginIfNotPresent(
      'babel-plugin-replace-global-env',
      { env: {
        [options.importPath]: globalEnv
      } },
      { before: ['module:ember-auto-import'] }
    );

    registry.add('htmlbars-ast-plugin', {
      name: 'remove-global-env-helper',
      plugin: this.removeGlobalEnvPlugin(globalEnv, options.helperName),
      baseDir() {
        return __dirname;
      }
    });
  },

  included() {
    this._super.included.apply(this, arguments);
    this.app = this._findHost();

  },

  addBabelPluginIfNotPresent(pluginName, pluginConfig, pluginOptions) {
    let target = this.app;
    if (!hasPlugin(target, pluginName)) {
      addPlugin(target, [
        require.resolve(`./lib/plugins/babel-plugin-replace-global-env`), pluginConfig
      ], pluginOptions);
    }
  },

  removeGlobalEnvPlugin(env, helper) {
    let plugin = require('./lib/plugins/hbs-plugin-remove-global-env-helper');
    return plugin({
      helper,
      env
    });
  },

  createEnv(environment, project) {
    let configPath = path.dirname(project.configPath());
    let config = path.join(configPath, 'global-env.js');
    if (!path.isAbsolute(config)) {
      config = path.join(project.root, config);
    }
    let appGlobalEnv = null;
    if (fs.existsSync(config)) {
      appGlobalEnv = require(config)(environment);
    } else {
      appGlobalEnv = this.app.options.globalEnv;
    }
    // if (!appGlobalEnv) {
    //   this.ui.writeWarnLine(
    //     `[${this.name}] global-env config not found in app!`
    //   );
    // }
    return Object.assign({}, getAppEnvs(), appGlobalEnv);
  },
};


function getAppEnvs() {
  return Object.keys(process.env).reduce((env, k) => {
    if (k.indexOf('APP_') === 0) {
      env[k] = process.env[k];
    }
    return env;
  }, {});
}
