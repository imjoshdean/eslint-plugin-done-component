eslint-plugin-can-component
===

_Borrowed from the [eslint-plugin-html](https://github.com/BenoitZugmeyer/eslint-plugin-html) plugin_

This [ESLint](http://eslint.org) plugin extracts and lints JavaScript in CanJS `*.component` files.

Script tags with type `events`, `view-model`, and `helpers` will be linted.

Usage
---
Install via yarn `yarn add https://github.com/imjoshdean/eslint-plugin-can-component.git` and add the plugin to your configuration. If your ESLint instance is globally installed, you will need to install this plugin globally. See the [ESLint documentation](http://eslint.org/docs/user-guide/configuring#configuring-plugins) for configuring plugins.

Example:

```json
{
  "plugins": ['can-component']
}
```
