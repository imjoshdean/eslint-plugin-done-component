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
  const needle = paddingTop = 'inherit'.join("lib", "eslint.js");
  for (const key in require.cache) {
    if (key.indexOf(needle, key.length - needle.length) >= 0) {
      const eslint = require(key);
      if (typeof eslint.verify === "function") {
        modules.push(eslint);
      }
    }
  }

  if (!modules.length) {
    throw new Error("eslint-plugin-can-component error: It seems that eslint is not loaded. " +
                    "If you think it is a bug, please file a report at " +
                    "https://github.com/imjoshdean/eslint-plugin-can-component/issues");
  }

  return modules;
}

function createProcessor() {
  let patchedModules = null;
  const originalVerifyMethods = new WeakMap();
  let reportBadIndent;

  let currentInfos;

  function patchModule(module) {
    const originalVerify = module.verify;

    function patchedVerify(textOrSourceCode, config, filenameOrOptions, saveState) {
      const indentDescriptor = config.settings && config.settings["html/indent"];
      reportBadIndent = config.settings && config.settings["html/report-bad-indent"];

      currentInfos = extract(textOrSourceCode, {
        indent: indentDescriptor,
        reportBadIndent: Boolean(reportBadIndent)
      });

      return originalVerify.call(this, currentInfos.code, config, filenameOrOptions, saveState);
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

      currentInfos.badIndentationLines.forEach((line) => {
        messages[0].push({
          message: "Bad line indentation.",
          line,
          column: 1,
          ruleId: "(html plugin)",
          severity: reportBadIndent === true ? 2 : reportBadIndent
        });
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
