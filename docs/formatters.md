# Formatters
**Formatters are (usually) small functions, used to format values in templates.**

To define a formatter, use `formatter` property in instance options:
```js
new Spreax(el, {
	formatters: {
		toUpperCase: s => String(s).toUpperCase()
	}
})
```
## Use cases
### Interpolation
Take a look at the code below:
```html
<h1>{ message | toUpperCase }</h1>
```
Whenever `message` changes, uppercased text will be inserted into DOM, not the original text.
### From Instance
formatters will be availble into instance, access them like this:
```js
instance.$formatters.toUpperCase('hello world')
```
## Piping
Formatters could be chained to each other, this is called "piping" (like unix pipes). 
```html
<span>{ string | trim | sluggify | upper }</span>
```
here, Spreax starts from left, and does these steps:
- passes `string` to `trim` function
- passes the returned value from previous step to next function; and repeats this until the end.

You can pipe formatters to each other, using `$pipeFormatters` method:
```js
const pipedFunction = instance.$pipeFormatters('trim', 'slugify', 'upper');

return pipedFunction(instance.string);
```