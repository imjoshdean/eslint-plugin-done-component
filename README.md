eslint-plugin-done-component
===

[![Build Status](https://travis-ci.org/imjoshdean/eslint-plugin-done-component.svg?branch=master)](https://travis-ci.org/imjoshdean/eslint-plugin-done-component)

_Borrowed from the [eslint-plugin-html](https://github.com/BenoitZugmeyer/eslint-plugin-html) plugin_

This [ESLint](http://eslint.org) plugin extracts and lints JavaScript in DoneJS's `*.component` files.

Script tags with type `events`, `view-model`, and `helpers` will be linted.

Usage
---
Install via yarn as `yarn add -D eslint-plugin-done-component` or npm as `npm i -D eslint-plugin-done-component` and add the plugin to your configuration. If your ESLint instance is globally installed, you will need to install this plugin globally. See the [ESLint documentation](http://eslint.org/docs/user-guide/configuring#configuring-plugins) for configuring plugins.

Example:

```json
{
  "plugins": ["done-component"]
}
```

Additionally, unless otherwise specified, when linting a folder, ESLint will only lint `.js` files. In order to have your `.component` files linted, you need to specify it with the `--ext` flag. Note that you need to also specify the `.js` extension if you do this.

Example:

```json
{
  "scripts": {
    "lint": "eslint src --ext .js --ext .component"
  }
}