# Hdash
[![CircleCI](https://circleci.com/gh/Hkh12/hdash.svg?style=svg)](https://circleci.com/gh/Hkh12/hdash)
![Dependencies](https://david-dm.org/Hkh12/hdash.svg)

A new front-end tool, to bring interactivity to web elements.
## Explanation
Hdash is not a framework or even a big library. and, it's not so concerned with rendering. Hdash's main duty is **to keep the interface synchronized with the state**. 

there is no any special elements; everything is marked and controlled using special attributes called **directives** that start with `h-`. There are some default ones, and, of course, you can make and register yours.

Using Hdash, there's no need to focus on front-end stuff (specially if you are a back-end dev). But Hdash would not be so useful in modern front-end projects (like a SPA).
## Get started
First, get Hdash's source code. intall it via npm (or yarn), or use a `<script>` tag:
```html
<script src="https://unpkg.com/hdash/dist/hdash.browser.js"></script>
```
now you should have a global variable called `Hdash`.
### Hello world
then, in your `app.js` (or any other name):
```js
var app = new Hdash('#app', {
	state: {
		text: 'Hello world!'
	}
})
```
and, your HTML document:
```html
<div id="app">
	<h1 h-text='text'></h1>
</div>
```
That's it, a "hello world" 🎉

This was just a simple demo, we used default `text` directive to tell Hdash: "hey, put the property 'text' of state into this h1 tag"

> There is no complete documentation for Hdash. after alpha (or beta) release, I'll start working on the official site.