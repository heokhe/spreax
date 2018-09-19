# Directives
Directives are special attributes used in Spreax to specifiy what an element can do. You can use them to attach event listeners to an element, change it's classname, etc.
## Syntax
Every directive starts with `sp-` and has three parts:
- **name**
- **argument** (depending on directive, it may be optional, required or illegal)
- **modifiers** (optional)

Let's see an example:
```html
<button sp-on:click.passive.prevent="doSomething">Click me</button>
```
directive name is `on`, argument is `click` (required) and we have two modifiers: `passive` and `prevent`. 
## Default directives
There are some default directives in Spreax, such as `on`, `model`, `class`, etc. We'll talk a lot about them.
## Directive "registry"
As I said, there are some default directives, and you can create yours. whenever Spreax finds a directive that is not a default one nor it was created by you, it throws an error.

**But how does Spreax understand this?** When a directive is "registered", it gets added to an object called "directive registry". 