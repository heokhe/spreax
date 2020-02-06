# Installing Spreax
## As a module
```sh
npm i spreax # npm
yarn add spreax # npm
```
```js
import Spreax, { state /* ... */ } from 'spreax';
```

## Using `<script>` tag
You can get it from **unpkg**:
```html
<script src="https://unpkg.com/spreax"></script>
```
A global variable `sp` will be available.
```js
var sp = {
  default: ..., // use this for creating instances
  state: ...,
  derived: ...,
  // ...
}
```

## Builds
Each build is compiled down to ES6 JavaScript.
Name | Usage
--- | ---
`spreax.esm.js` | ES module
`spreax.cjs.js` | CommonJS module
`spreax.browser.js` | Browser code
`spreax.browser.min.js` | Browser code (minified)