# Installation
## Direct `<script>` include
Spreax is availabe on [unpkg](https://unpkg.com/#), You can include it your HTML document like this:
```html
<script src='https://unpkg.com/spreax/dist/spreax.browser.js'></script>
```
If you want the minified build, insert a `.min` before `.js` file extension.

You can write the code above in a shorter way:
```html
<script src='https://unpkg.com/spreax'></script>
```
Now `Spreax` variable is available in global context (`window`).
## Installing as a Node module
You can install Spreax using package managers, and bundle them with your code with famous bundling tools like [Webpack](https://webpack.js.org), or [Rollup](https://rollupjs.org):
```sh
yarn add spreax # or `npm install spreax`
```
## Different builds
| Name | Description |
| --- | --- |
| `spreax.browser.js` | Browser build |
| `spreax.browser.min.js` | Browser build, minified |
| `spreax.cjs.js` | CommonJS module (used with `require` function) |
| `spreax.esm.js` | ES module (used with `import` statement) |