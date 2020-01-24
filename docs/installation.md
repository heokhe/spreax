# Installing Spreax
## npm
```shell
npm install spreax
```
Or if you prefer Yarn:
```shell
yarn add spreax
```

## Using in browser
You can get it from **unpkg**:
```html
<script src="https://unpkg.com/spreax"></script>
```
A global variable called `sp` will be available.
```js
var sp = {
  default: ..., // use this for creating instances
  state: ...,
  derived: ...,
  // ...
}
```

## Different builds
Name | Usage
--- | ---
`spreax.esm.js` | ES module
`spreax.cjs.js` | CommonJS module
`spreax.browser.js` | Browser code
`spreax.browser.min.js` | Browser code (minified)