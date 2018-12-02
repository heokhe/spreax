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
You can use shortcuts as a handy way:
```html
<button sp-on:click='dialogIsOpen = false'>close</button>
```
You can assign primitive values (numbers, strings, `null`, `undefined` and booleans) to properties. in addition to that, you can assign the value of another property.
```html
<button sp-on:click='prop = !0'>true</button> <!-- !0 is equal to `true` -->
<button sp-on:click='prop = !1'>false</button> <!-- and !1 is equal to `false` -->
<button sp-on:click='prop = "something"'>string</button>
<button sp-on:click='prop = 123.45'>number</button>
<button sp-on:click='prop = null'>null</button>
<button sp-on:click='prop = undefined'>undefined</button>
<button sp-on:click='prop = anotherProp'>another property</button>
```
### Available modifiers
- **prevent**: implements `event.preventDefault()`
- options in `addEventListener` methods: `once`, `passive` and `capture`