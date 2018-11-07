# Getting started with Spreax
## Creating an instance
In Spreax, everything starts with **creating an instance**:
```js
var instance = new Spreax(element, options);
```
Now, let's discover those arguments:
- **element**: The root element of your instance. it can be a selector string, or a DOM node.
- **options**: An object containing everything your instance needs (like **state** and **actions**).
## Hello world
Now, we want to build our "Hello, world" app with Spreax. 

This is our HTML:
```html
<div id="app">
	<h1>#[message]</h1>
</div>
```
And, our instance:
```js
var app = new Spreax('#app', {
	state: {
		message: 'Hello, world!'
	}
})
```
Assuming everything is going right, You'll see a big "Hello, world!" message.
You may think nothing special has happened, but Spreax has done a lot; now everything is **reactive**.

Now, open the JavaScript console and type this:
```js
app.message = 'Another message'
```
And the message has been changed! 
## Explanation
- `state` object is actually the reactive data your app needs.
- every property in `state` is now available in `app` object.
- we used `#[message]` into `h1` tag to tell Spreax "hey, put the value of `message` property of state into this element". This feature is called **text interpolation**. Of course you can mix this expression with regular text; for example `<h1>hello #[name]</h1>`

> for better readability, you can seperate the braces and property name with a space, like `#[ message ]`