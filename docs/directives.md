# Built-in directives

## Conditions
```js
const showTheMessage = state(true);
```
```html
<span @if="showTheMessage">Now (!!showTheMessage.value === true) you see me!</button>
```

## Loops
```js
const items = state([
  'Item 1',
  'Item 2',
  'Third item',
  'Another item',
  '...Yet another one'
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
    <!-- Also you can do @(items[i]) -->
  </li>
</ul>
```

## Attaching event listeners to elements
```js
const name = state('Jack');
function log(event) {
  console.log(name.value); // logs 'Jack'
}
const app = new Spreax('#app', { name }, { log })
```
The third argument (`{ log }`) is a map of functions, called **actions**.
```html
<button @on:click="log">Log to the console</button>
```
When you click the button, `log()` will be called.
