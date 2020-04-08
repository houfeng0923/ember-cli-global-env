const path = require('path');

function plugin(babel) {
  let t = babel.types;

  function buildIdentifier(value, name) {
    let replacement = typeof value === 'boolean'
    ? t.booleanLiteral(value)
    : t.stringLiteral(value);

    return t.addComment(replacement, 'trailing', ` ${name} `);
  }

  return {
    name: 'babel-plugin-replace-global-env',
    visitor: {
      ImportSpecifier(path, state) {
        let importPath = path.parent.source.value;
        let flagsForImport = state.opts.env[importPath];

        if (flagsForImport) {
          let flagName = path.node.imported.name;
          let localBindingName = path.node.local.name;

          if (!(flagName in flagsForImport)) {
            throw new Error(
              `Imported ${flagName} from ${importPath} which is not a supported flag.`
            );
          }

          let flagValue = flagsForImport[flagName];
          if (flagValue === null) {
            return;
          }

          let binding = path.scope.getBinding(localBindingName);

          binding.referencePaths.forEach(p => {
            p.replaceWith(buildIdentifier(flagValue, flagName));
          });

          path.remove();
          path.scope.removeOwnBinding(localBindingName);
        }
      },

      ImportDeclaration: {
        exit(path, state) {
          let importPath = path.node.source.value;
          let flagsForImport = state.opts.env[importPath];

          // remove flag source imports when no specifiers are left
          if (flagsForImport && path.get('specifiers').length === 0) {
            path.remove();
          }
        },
      },
    },
  };
}

plugin.baseDir = function() {
  return path.dirname(__dirname);
};

module.exports = plugin;
