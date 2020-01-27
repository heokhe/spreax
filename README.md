# Spreax
<img src="logo.png" alt="Spreax logo" width="120" align="right">

Spreax is a library to help you make pure web applications, Without any bloat and Virtual DOM stuff. 
It has a size of ~2.7KB (minified, gzipped) and doesn't force you to deliver large payloads of JavaScript code.
It also supports TypeScript.

Spreax isn't created for doing anything new; **It only takes care of the state and synchronizes the UI with it.**

# How?
Spreax doesn't render anything. Instead, after every state change, it updates the elements (their text content, attributes, ...) to synchronize the UI with the state. 
<center>
<img src="diagram.png" alt="A diagram demonstrating how Spreax works." width="550" align="center">
</center>

# Get Started
Install it by executing:
```sh
npm i spreax # npm
yarn add spreax # npm
```
See more in [Installtion docs](docs/installation.md).

# Docs
See [docs folder](docs).