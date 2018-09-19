# User actions
## Actions
Actions are functions provided to Spreax with `options.actions`, that could be called everywhere.
```js
new Spreax(el, {
	actions: {
		log() {
			console.log(this.message) // actions have access to instance properties
		}
	}
})
```
## Event listeners
There is a default directive named `sp-on`. It is used for attaching event listeners to elements. 
```html
<button sp-on:click='doSomeThing'>click me</button>
```
whenever user clicks on this button, it executes the `doSomeThing` action.
### Multiple events
You can use multiple events for one element, of course:
```html
<button sp-on:click='doSomeThing' sp-on:mouseover='doSomeThingElse'>click or hover over me</button>
```
### Shortcuts
Defining actions for just a mutation is hard, so you can use shortcuts:
```html
<button sp-on:click='dialogIsOpen = false'>close</button>
```
Currently you can use these values:
- **booleans**: `true`, `false`, `!0` or `!1`
- **string**
- **numbers**: integers and decimals
- **null**
- **property name**: name of another property 
### Available modifiers
- **prevent**: implements `event.preventDefault()`
- options in `addEventListener` methods: `once`, `passive` and `capture`