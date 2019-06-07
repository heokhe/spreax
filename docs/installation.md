# Installing Spreax
## npm
```shell
npm install --save spreax
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
  Spreax: ...,
  Directive: ...,
  register: ...
}
```

## Different builds
Name | Usage
--- | ---
`spreax.esm.js` | ES module
`spreax.cjs.js` | CommonJS module
`spreax.browser.js` | Browser code
`spreax.browser.min.js` | Browser code (minified)