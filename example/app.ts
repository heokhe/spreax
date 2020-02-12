import Spreax, {
  state, action, push, splice, derived
} from '../src/index';

interface Todo {
  title: string;
  completed: boolean;
}

const todos = state([] as Todo[]);
const handleKeydown = action((_: unknown, event: KeyboardEvent) => {
  const input = event.target as HTMLInputElement;
  if (event.code === 'Enter' && input.value) {
    push(todos, {
      title: input.value,
      completed: false
    });
    input.value = '';
  }
});
const removeTodo = action((index: number) =>
  splice(todos, index, 1));
const removeCompletedTodos = action(() =>
  todos.update(ts =>
    ts.filter(t =>
      !t.completed)));
const removeAllTodos = action(() => todos.set([]));
const todosLeft = derived(() =>
  todos.value.filter(todo => !todo.completed).length);
const removeCompletedIsDisabled = derived(() =>
  todos.value.length === 0 || todosLeft.value === todos.value.length);

const app = new Spreax(
  '#app',
  {
    todos,
    handleKeydown,
    todosLeft,
    removeCompletedIsDisabled,
    removeTodo,
    removeCompletedTodos,
    removeAllTodos
  }
);

globalThis.app = app;
