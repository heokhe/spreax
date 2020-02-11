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
<script src="https://unpkg.com/spreax/dist/browser.js"></script>
```
A global variable `spreax` will be available.
```js
window.spreax = {
  default: ..., // Spreax itself
  state: ...,
  derived: ...,
  // ...
}
```
### Using `type="module"`
```js 
import Spreax, { state } from 'https://unpkg.com/spreax';
```

## Builds
Each build is compiled down to ES6 JavaScript.
Name | Format
--- | ---
`esm.js` | ES Module
`esm.min.js` | ES Module (minified)
`browser.js` | IIFE (for browsers)
`cjs.js` | CommonJS