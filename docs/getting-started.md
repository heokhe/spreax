# Getting started with Spreax

## Creating an instance 
To make Spreax work, you must create an **instance** attached to an element and define your app's [state](https://en.wikipedia.org/wiki/State_(computer_science)):

```js
import { Spreax } from 'spreax' // ES module
const { Spreax } = require('spreax') // CJS module
var Spreax = sp.Spreax // browser

const instance = new Spreax({
  el: document.getElementById('app'),
  state: {
    msg: 'hello'
  }
})
```
```html
<div id='app'>
  <output>Message: @(msg)</output>
</div>
```

Now when you open the page, you will see message "hello". This feature is called **text interpolation**.

Now open the console and write `instance.msg = 'goodbye'` and you'll see the message change to "goodbye".

In addition of text interpolation, you can dynamically set attributes:
```html
<div @attr:title='msg'>Hover over me to see the message!</div>
```
> Attributes starting with `@` are called **Directives** and they add extra behavior to elements. Spreax includes [built-in directives](builtins.md) and you create custom ones too.

Here `@attr` is saying: "keep the value of `title` attribute up-to-date with property `msg`".