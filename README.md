ember-cli-global-env
==============================================================================

support global env const in js and hbs for ember app.


Features
------------------------------------------------------------------------------

- support js and hbs files
- minify code in production mode



Compatibility
------------------------------------------------------------------------------

* Ember.js v3.2 or above
* Ember CLI v2.13 or above
* Node.js v10 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-cli-global-env
```


Usage
------------------------------------------------------------------------------

By default, automatic import all `APP-*` variables in `process.env`, so you can use it directly;
otherwise, your can define extra const in `config/global-env.js`.

```js
// config/global-env.js

module.exports = function (environment) {
  const flags = {
    CFX: process.env['APP_BRAND'] === 'cfx',
    Token: 'xxxxx'
  };

  return flags;
};
```

Additional options can be specified using the `global-env` config property in `ember-cli-build.js`:

```js
let app = new EmberApp({
  'global-env': {...}
});
```

**Available Options:**

- `helperName`: default is **env**, a helper for access global env in template
- `importPath`: default is **@global/env**, so you can import global env from this path


Example
------------------------------------------------------------------------------

### hbs

source:

```hbs
{{env 'Token'}}

{{#if (env 'CFX')}}
  <div>cfx template....</div>
{{/if}}

{{other-component}}
```

output (in building before opcode) :

```hbs
xxxxxx

<div>cfx template....</div>

{{other-component}}
```

### js

source:

```js
import { CFX, Token } from '@global/env';

export default class IndexRoute extends Route {
  init() {
    console.log(Token);
    if (!CFX) {
      console.log('cfx logic');
    }
  }
}
```

output (in production mode)

```js
export default class IndexRoute extends Route {
  init() {
    console.log('xxxxxx');
  }
}
```

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
