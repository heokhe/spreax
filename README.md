# Ryo ✨➡️
A new front-end library for building views.
## Why so?
Nowadays, making a website with a great UX requires using one of the big frameworks, such as Vue, Angular, React, etc.
These are all concerned with rendering things, and integrating them with servers requires hard work.
And, You can't render them on the server, if you're not using Node.js as back-end core. (you can use Vue in your HTML, but that's not so SEO-friendly.)
However, not using them is unavoidable as a modern front-end developer, jQuery is obsolete nowadays, And you may not need components, those additional files (.jsx, .vue, etc.) and other shiny things in your project. In fact, the most important work of a modern front-end framework or library is **keeping the interface synchronized with the state**.

Ryo is the solution for these cases. It doesn't need any dependencies, files and loaders, compilers, etc. Just load it with a `script` tag, create an instance, and boom!
## Get started
### Installation
> It's not still published, and there's already a package named Ryo in NPM registry. (to be decided)
### Usage
Imagine this is your HTML document:
```html
<body>
	<div id="app"></div>
</body>
<script src='/path/to/ryo.js'></script>
<script src='/path/to/app.js'></script>
```
And, `app.js`:
```js
var app = new Ryo('#app', {
	// state: ...
	// actions: ...
})
```
**Now you have a Ryo instance! 🎉**