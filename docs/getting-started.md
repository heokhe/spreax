# Getting started with Spreax

## Stage 1: Create a greeting app
Ok. We've installed the library, And we're going to create a simple greeting app.
```js
import Spreax, { state } from 'spreax';
const name = state('Hosein');
const app = new Spreax('#app', { name });
```
```html
<div id='app'>
  Hello @(name)
</div>
```
Let's break this down:

- `name` is a **state variable**. You can assing another value to it, And things will get updated.
- `app` is an instance of Spreax. It does the work for everything in `<div id='app'>`.
- `@(name)` means to Spreax. Whenever `name` is updated, Spreax inserts its value there.

Open the page in your browser. You should be seeing the sentence `Hello Hosein`.

Now, try changing the name:
```js
name.set('Jack');
```
The sentence has been updated to `Hello Jack`. Isn't it cool?

## Stage 2: Allowing the viewers to enter their names
Now, we want a `<input>` to enter a name and see a warm greeting message. Let's change our HTML:
```html
<div id='app'>
  <input type='text' @bind='name'>
  Hello @(name)
</div>
```
And that's it!

- When you type in the input, `name.set()` will be called.
- If you manually call `name.set()`, input's value will be updated.

Attributes starting with `@`, called **directives**, are meaningful to Spreax. You'll learn about them later.