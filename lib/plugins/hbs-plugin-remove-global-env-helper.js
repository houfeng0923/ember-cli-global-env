'use strict';

const Node = require('ember-template-lint/lib/helpers/ast-node-info');

const debug = require('debug')('global-env:debug');
const error = require('debug')('global-env:error');

module.exports = function (options) {
  function RemoveGlobalEnvHelperPlugin() {
  }

  RemoveGlobalEnvHelperPlugin.prototype.transform = function (ast) {
    let builder = this.syntax.builders;
    let walker = new this.syntax.Walker();
    walker.visit(ast, function _replace(node) {
      let children;
      if (node.type === 'Program' || node.type === 'Block') {
        children = node.body;
      } else if (node.type === 'ElementNode') {
        children = node.children;
      }
      if (children) {
        for (let i = children.length - 1; i >= 0; i--) {
          let entry = children[i];
          let replaceNode;
          try {
            replaceNode = replace(entry, options, builder);
          } catch(e) {
            error(e);
          }
          if (replaceNode && replaceNode !== entry) {
            replaceNode = isArray(replaceNode) ? replaceNode : [replaceNode];
            let replaceAst = builder.program(replaceNode);
            walker.visit(replaceAst, _replace);
            children.splice(i, 1, ...replaceAst.body);
          }
        }
      }
    });

    return ast;
  };

  RemoveGlobalEnvHelperPlugin.toJSON = function() {
    return {
    [RemoveGlobalEnvHelperPlugin.name]: options
    }
  };

  RemoveGlobalEnvHelperPlugin.parallelBabel = {
    requireFile: __filename,
    buildUsing: 'self',
  };

  return RemoveGlobalEnvHelperPlugin;
};

module.exports.self = function () { return module.exports(); };

function replace(node, options, builder) {
  let env = options.env;
  let helper = options.helper;
  let resultNode = node;
  let isIf = Node.isIf(node);
  let isUnless = Node.isUnless(node);
  let isMustache = Node.isMustacheStatement(node);
  if(isIf || isUnless) {
    if (isEnvExpression(node.params[0], helper)) {
      let {result, key, val} = evalEnvExpression(node.params[0], env);
      debug(`{{${isIf ? 'if' : 'unless'} (${helper} ${key} ${val || ''})}} => ${result}`);
      let suppressed = isIf ? !result : result;
      resultNode = compressCondition(node, suppressed, builder);
    }
  } else if (isMustache) {
    if (isEnvExpression(node, helper)) {
      let {result, key } = evalEnvExpression(node, env);
      debug(`{{${helper} ${key}}} => ${result}`);
      let expected = env[key];
      resultNode = compressEvaluation(node, expected, builder);
    }
  }
  if (isNone(resultNode)) {
    resultNode = builder.comment(helper);
  }
  return resultNode;
}

function compressCondition(node, suppressed, builder) {
  let result = node;
  if (Node.isMustacheStatement(node)) {
    result = !suppressed ? node.params[1] : node.params[2];
    if (result && Node.isStringLiteral(result)) {
      result = builder.text(result.original, result.loc);
    } else if (result && Node.isSubExpression(result)) {
      result = builder.mustache(
        result.path, result.params, result.hash, !result.escaped, result.loc
      );
    }
  } else if (Node.isBlockStatement(node)) {
    result = !suppressed
      ? (node.program && node.program.body)
      : (node.inverse && node.inverse.body);
  }
  return result;
}

function compressEvaluation(node, text, builder) {
  return builder.text(text, node.loc);
}

function isEnvExpression(node, envHelperName) {
  return node && node.path && Node.isPathExpression(node.path) && node.path.original === envHelperName;
}

function evalEnvExpression(envNode, env) {
  let [keyNode, valNode] = envNode.params || [];
  let key = keyNode && keyNode.original || null;
  let val = valNode && valNode.original || null;
  let envVal = env[key];
  let result = envVal;
  if (!isBoolean(envVal) && !isNone(valNode) && !isNone(val)) {
    result = envVal === val;
  }
  return {key, val, result};
}

function isBoolean(val) {
  return val === true || val === false;
}

function isNone(val) {
  return val === null || val === undefined;
}

function isArray(val) {
  return Array.isArray(val);
}
