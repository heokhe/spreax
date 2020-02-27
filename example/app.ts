import Spreax, {
  state, action, splice, derived, push, setPath
} from '../src/index';
import AddTodo from './add-todo';
import TodoItem from './todo-item';

interface Todo {
  title: string;
  done: boolean;
}

const todos = state([] as Todo[]);

const removeTodo = action((_, i: number) =>
  splice(todos, i, 1));
const removeCompletedTodos = action(() =>
  todos.update(ts =>
    ts.filter(t =>
      !t.done)));
const removeAllTodos = action(() => todos.set([]));
const todosLeft = derived(() =>
  todos.value.filter(todo => !todo.done).length);
const removeCompletedIsDisabled = derived(() =>
  todos.value.length === 0 || todosLeft.value === todos.value.length);
const addTodo = action((event: CustomEvent<Todo>) =>
  push(todos, event.detail));
const toggleTodo = action((_, i: number) => {
  // console.log(todos.value[i].done);
  setPath(todos, [i.toString(), 'done'], !todos.value[i].done);
});

const app = new Spreax(
  '#app',
  {
    todos,
    todosLeft,
    removeTodo,
    removeCompletedTodos,
    removeAllTodos,
    removeCompletedIsDisabled,
    addTodo,
    toggleTodo
  },
  {
    'add-todo': AddTodo,
    'todo-item': TodoItem
  }
);

globalThis.app = app;

for (let i = 1; i <= 10; i++)
  push(todos, { done: false, title: i.toString() });
setPath(todos, ['2', 'done'], true);
setPath(todos, ['7', 'done'], true);
console.log(todos.value);
removeCompletedTodos.value();
// console.log(todos.value);
