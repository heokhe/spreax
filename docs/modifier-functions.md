# Modifier functions
Modifier functions help you to modify the variables with more complex data structures, or just write less code for a simple state modifications.

## Usage
```js
import { push, set, increase } from 'spreax';
```
Modifier functions always return `void`.

## Arrays
### `push(array: Variable<T[]>, ...items: T[])`
Behaves similarly to `Array.prototype.push`.
```js
const array = state([1, 2, 3]);
push(array, 4, 5);
console.log(array.value) // -> [1, 2, 3, 4, 5]
```

### `unshift(array: Variable<T[]>, ...items: T[])`
Behaves similarly to `Array.prototype.unshift`.

### `splice(array: Variable<T[]>, start: number, deleteCount: number, ...items: T[])`
Behaves similarly to `Array.prototype.splice`.

### `setIndex(array: Variable<T[]>, index: number, newValue: T)`
Sets `array[index]` to `newValue`.
```js
const array = state([1, 2, 3]);
setIndex(array, 0, 7);
console.log(array.value) // -> [7, 2, 3]
```

## Numbers
### `increase(state: Variable<number>, x: number)`
Increases the value by `x` (1 by default).
```js
const n = state(2);
increase(n, 8) // n = 10
increase(n) // n = 11 because `x` will default to 1
```

### `decrease(state: Variable<number>, x: number)`
Decreases the value by `x` (1 by default).

## Objects

### `set(object: Variable<T>, key: K, value: T[K])`
Sets the `key` of `object` to `value`.
```js
const person = state({
  name: 'Joe',
  age: 20
});
set(person, 'age', 40);
console.log(person.value) // -> { name: 'Joe', age: 40 }
```

### `merge(a, b)`
Merges `b` into `a`.
```js
const a = state({ foo: 1 }),
  b = state({ bar: 'baz' });
merge(a, b);
console.log(a.value) // -> { foo: 1, bar: 'baz' }
```

### `setPath(object: Variable<any>, path: string[], value: any)`
Sets the `path` of `object` to `value`.
```js
const object = state({
  a: {
    b: {
      c: {
        d: [0, 2]
      }
    }
  }
});
setPath(object, ['a', 'b', 'c', 'd', '0'], 7);
console.log(object.value)
/*
{
  a: {
    b: {
      c: {
        d: [7, 2]
      }
    }
  }
}
*/
```