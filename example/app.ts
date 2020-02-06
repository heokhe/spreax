import Spreax, { state, action, splice } from '../src/index';

const users = state([
  {
    name: 'Akbar',
    age: 47,
    isAlive: true
  },
  {
    name: 'Hosein',
    age: 15,
    isAlive: false
  },
  {
    name: 'Joe',
    age: 18,
    isAlive: false
  }
]);
const removeUser = action((i: number) =>
  splice(users, i, 1));
const sortByAge = action(() =>
  users.update(u =>
    [...u].sort((a, b) => b.age - a.age)));
const reverseOrder = action(() =>
  users.update(u => [...u].reverse()));
const app = new Spreax(
  '#app',
  {
    users, removeUser, sortByAge, reverseOrder
  }
);

globalThis.app = app;
