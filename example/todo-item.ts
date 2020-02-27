import {
  component, prop, action, derived
} from '../src/index';

const Template = `
  <style>
    .todo {
      display: flex;
      align-items: center;
      min-height: 2em;
      line-height: 1;
    }

    .todo > input {
      width: 2em;
      margin: 0;
    }

    .todo > div {
      width: 100%;
    }

    .todo.done > div {
      text-decoration: line-through;
      opacity: .5;
    }
  </style>
  <div class="todo" @class:done>
    <div><slot></slot></div>
    <button @on:click="toggle()">
      [<span @css:opacity="buttonCheckOpacity">x</span>]
    </button>
    <button @on:click="remove()">&times;</button>
  </div>
`;

export default component(Template, ({ dispatch }) => {
  const done = prop(false);
  const remove = action(() => dispatch('remove', null));
  const buttonCheckOpacity = derived(() => (done.value ? 1 : 0));
  const toggle = action(() =>
    dispatch('toggle', null));
  return {
    done, buttonCheckOpacity, remove, toggle
  };
}, ['done']);
