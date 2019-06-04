# Built-in directives

## Attaching Event listeners
```js
const instance = new Spreax({
  el: ...,
  state: {
    name: 'John'
  },
  methods: {
    alertName() {
      alert(this.name)
    }
  }
})
```
If you do `instance.alertName()`, "John" will be alerted.
```html
<button @on:click='alertName()'>Alert</button>
```
Here we used `@on` directive with parameter `click` (yes, they accept parameters), And if you click on this button, `instance.alertName` will be called.

Also we can use `@on` to assign a value to a property: 
```html
<button @on:click='number += 1'>Increase</button>
<button @on:click='number -= 1'>Decrease</button>
<button @on:click='number = 0'>Reset</button>
```
And, you can do `event.preventDefault()`:
```html
<form @on:submit.prevent='handleSubmit()'>...</form>
```
> Parts after the dot like `.prevent` are called **options**.

## Conditions
Using `@if` directive, you can toggle the existence of an element:
```html
<div @if='isVisible'>Now you see me!</div>
<div @if='!isVisible'>You can use the ! operator</div>
<div @if='x == 0'>
  Also you can compare values (if x === any value except 0, it won't render)
</div>
<div @if='x != 0'>!= is possible too</div>
```
> Not only `@if` but every directive accepts JS expressions.

## Two-way binding
The `@bind` directive makes two-way binding between form input and app state a breeze:
```html
<input type='text' placeholder='your name' @bind='name'>
```
As you type in the input, value of `name` property name will be updated.