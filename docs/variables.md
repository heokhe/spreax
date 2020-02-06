# Variables
Variables are objects that are passed to an Spreax, contain a value, and can be changed.
```js
const number = state(0); // number is a "state variable"
console.log(number.value); // -> 0
number.set(1); // change the value to 1
console.log(number.value, number.prevValue); // -> 1, 0
```
You can listen for changes in every variable. This is called subscribing.
```js
number.subscribe((n, prevN) => {
  console.log(`n was ${prevN}, now it's ${n}`);
})
```

## State Variables
State variables are those you can manually change their value.
```js
const number = state(0); // number is a "state variable"
number.set(1);
```
Or, you can update them.
```js
n.update(n => n + 1);
// roughly equivalent to:
n.set(n.value + 1);
```

## Derived Variables
Derived vars are those that their value is derived from other variables.
```js
const name = state('Hosein');
const upperCasedName = derived(() => name.value.toUpperCase());
// upperCasedName.value === 'HOSEIN'
```
You can't assign a value to `upperCasedName` in this case. Instead, you must change the value of name, and upperCasedName will be updated too.
```js
name.set('Jack');
// upperCasedName.value === 'JACK'
```
### Using setter functions
Consider the following example:
```js
const x = state(2);
// y = 2x
const y = derived(
  () => x.value * 2,
  // the second argument is called setter function:
  n => x.set(n / 2)
);
console.log(y.value); // 2*2 = 4

// y = 10 => x = 5
y.set(10);
console.log(x.value); // 10/2 = 5
```

## Constants
As the name explains, they cannot be changed:
```js
const PI = constant(3.14);
PI.set(2);
console.log(PI.value); // still 3.14
```