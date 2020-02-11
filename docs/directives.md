# Directives
As we said in the previous file, Attributes starting with `@` are called directives and are meaningful to Spreax. A directive is written as:
```
@<name>[:<parameter>]="<expression>"
```
There are a handful of directives in Spreax and we'll learn about them below.

## Conditional Rendering: `@if`
```js
const showTheMessage = state(true);
```
```html
<span @if="showTheMessage">
  Now you see me!
</span>
```
Whenever `showTheMessage.value` is a truthy value, the span will be rendered.

## Iterating over arrays: `@for`
```js
const items = state([
  'Item 1',
  'Item 2',
  'Third item',
  'Another item'
]);
```
```html
<ul>
  <li @for="item of items">
    @(item)
  </li>
  <!-- i is the index (zero-based) -->
  <li @for="item, i of items">
    @(i). @(item)
  </li>
</ul>
```

## Attaching event listeners to elements: `@on`
```js
const name = state('Jack');
const log = action(parameter => {
  console.log(parameter);
})
```
```html
<button @on:click="log(name)">Log to the console</button>
```
When you click the button, `log(name)` will be called, and `Jack` is printed to the console.

## Two-way binding: `@bind`
Use it to handle user input:
```js
const name = state('');
```
```html
<input @bind="name" placeholder="Enter your name">
```
- When you type in the input, `name.set()` will be called.
- If `name` is changed, input's value will be updated too.

> `@bind` works well with `number`, `range` and `checkbox`inputs too.

## Controlling Attributes: `@attr`
```js
const message = state('Hello');
const disabled = state(true);
```
```html
<button @attr:title="message" @attr:disabled="disabled">
<!-- <button title="Hello" disabled> -->
```

## Styling Elements: `@css`
```js
const myColor = state('#2196f3');
```
```html
<div @css:background-color="myColor">I'm Blue!</div>
```

## Controlling Classnames: `@class`
```js
const isActive = state(true);
```
```html
<button class="button" @class:active="isActive">Click me</button>
```
If `isActive.value` is truthy, the button will have the class `active`.