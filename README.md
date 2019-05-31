# Spreax
Tiny (~3 KB gzipped) library for making reactive views, without virtual DOM.

# Features
* State, Methods, Getters (computed properties)
* Bind values to inputs
* Text interpolation
* Attach event listeners to elements
* and... 

# How?
Spreax doesn't render anything. Instead, after every state change, it updates the elements (their text content, attributes, ...) to synchronize the view with the state. 
**You don't have to write your template in JavaScript; just configure Spreax and write the app logic.**

# Demo
See more in [Example Page](./index.html):
```bash
git clone https://github.com/hkh12/spreax
npm run build
npm run serve
```

# Why?
Most importantly, **Performance**. Vue and React do their job very well, but they force you to deliver large JavaScript payloads, Because everything is rendered by JavaScript code. 

Spreax may not be used in large apps, but it's useful for small projects.