# Getting started with Spreax
So, We've learned to install and import Spreax into our applications.
As the first step, We're going to show a simple message using Spreax:

```js
import Spreax, { state } from 'spreax'; // assuming we're using ES modules

const name = state('World');
const app = new Spreax('#app', { name });
```
```html
<div id="app">
  Hello @(name)
</div>
```

Open the page in a browser, and there is a "hello world" message.

Let's break this down:

- `app` is an instance of Spreax. It does the work for everything in `<div id='app'>`. The first argument can be a element or its selector, and the second one is a map of [variables](variables.md).
- `name` is a **state variable**. You can assign a value to it, And things will get updated.
- `@(name)` means to Spreax. Whenever `name` is updated, Spreax inserts its value there. This feature is called **text interpolation**.

Open the page in your browser. You should be seeing the sentence `Hello Hosein`.

Now, try changing the name:
```js
name.set('Jack');
// or: app.variables.name.set('Jack')
```
The sentence has been updated to `Hello Jack`. Isn't it cool?

## Stage 2: Allowing the viewers to enter their names
Now, we want a `<input>` to enter a name and see a custom message. Let's change our HTML:
```html
<div id="app">
  <input type="text" @bind="name">
  Hello @(name)
</div>
```
And that's it!

- When you type in the input, `name.set()` will be called.
- If you manually call `name.set()`, input's value will be updated.

Attributes starting with `@`, called **directives**, are meaningful to Spreax. You'll learn about them [later](directives.md).