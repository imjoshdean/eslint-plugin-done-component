"use strict"

const path = require("path");
const extract = require("./extract");

// Disclaimer:
//
// This is not a long term viable solution. ESLint needs to improve its processor API to
// provide access to the configuration before actually preprocess files, but it's not
// planed yet. This solution is quite ugly but shouldn't alter eslint process.
//
// Related github issues:
// https://github.com/eslint/eslint/issues/3422
// https://github.com/eslint/eslint/issues/4153

function findESLintModules() {

  if (!require.cache || Object.keys(require.cache).length === 0) {
    // Jest is replacing the node "require" function, and "require.cache" isn't available here.
    return [require("eslint/lib/eslint")];
  }

  const modules = [];
  const needle = path.join("lib", "eslint.js")
  for (const key in require.cache) {
    if (key.indexOf(needle, key.length - needle.length) >= 0) {
      const eslint = require(key);
      if (typeof eslint.verify === "function") {
        modules.push(eslint);
      }
    }
  }

  if (!modules.length) {
    throw new Error("eslint-plugin-done-component error: It seems that eslint is not loaded. " +
                    "If you think it is a bug, please file a report at " +
                    "https://github.com/imjoshdean/eslint-plugin-done-component/issues");
  }

  return modules;
}

function createProcessor() {
  let patchedModules = null;
  const originalVerifyMethods = new WeakMap();

  let currentInfos;

  function patchModule(module) {
    const originalVerify = module.verify;

    function patchedVerify(textOrSourceCode, config, filenameOrOptions, saveState) {
      currentInfos = extract(textOrSourceCode, { });

      const verified = currentInfos.map(info => {
        return originalVerify.call(this, info.code, config, filenameOrOptions, saveState);
      });

      if (verified.length) {
        return verified.reduce((a, b) => a.concat(b));
      }

      return verified;
    }

    originalVerifyMethods.set(module, originalVerify);

    module.verify = patchedVerify;
  }

  function unpatchModule(module) {
    const originalVerify = originalVerifyMethods.get(module);
    if (originalVerify) {
      module.verify = originalVerify;
    }
  }

  return {

    preprocess (content) {
      patchedModules = findESLintModules();
      patchedModules.forEach(patchModule);

      return [content];
    },

    postprocess (messages) {
      patchedModules.forEach(unpatchModule);
      patchedModules = null;
      messages[0].forEach((message) => {
        message.column += currentInfos.map[message.line] || 0;
      });

      messages[0].sort((ma, mb) => {
        return ma.line - mb.line || ma.column - mb.column;
      });

      return messages[0];
    },

  }

}

const componentProcessor = createProcessor();

exports.processors = {
  '.component': componentProcessor
};
