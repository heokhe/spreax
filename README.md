# Ryo
[![CircleCI](https://circleci.com/gh/Hkh12/ryo.svg?style=svg)](https://circleci.com/gh/Hkh12/ryo)
![Dependencies](https://david-dm.org/Hkh12/ryo.svg)

A new front-end tool, to bring interactivity to web elements.
## Explanation
Ryo is not a framework or even a big library. and, it's not so concerned with rendering. Ryo's main duty is **to keep the interface synchronized with the state**. 

there is no any special elements; everything is marked and controlled using special attributes called **directives** that start with `r-`. There are some default ones, and, of course, you can make and register yours.

Using Ryo, there's no need to focus on front-end stuff (specially if you are a back-end dev). But Ryo would not be so useful in modern front-end projects (like a SPA).
## Get started
First, get Ryo's source code. intall it via npm (or yarn), or use a `<script>` tag:
```html
<srcipt src="https://unpkg.com/ryo/dist/ryo.browser.js"></srcipt>
```
now you should have a global variable called `Ryo`.
### Hello world
then, in your `app.js` (or any other name):
```js
var app = new Ryo('#app', {
	state: {
		text: 'Hello world!'
	}
})
```
and, your HTML document:
```html
<div id="app">
	<h1 r-text='text'></h1>
</div>
```
That's it, a "hello world" 🎉

This was just a simple demo, we used default `text` directive to tell Ryo: "hey, put the property 'text' of state into this h1 tag"

> There is no complete documentation for Ryo. after alpha (or beta) release, I'll start working on the official site.