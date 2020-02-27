import { component, action } from '../src/index';

const Template = `
  <style>
    input {
      width: 100%;
      font-size: .9rem;
      padding: .25rem
    }
  </style>
  <input
    autofocus
    type="text"
    @on:keydown="handleKeydown()"
    placeholder="What needs to be done? (Press enter)">
`;

export default component(Template, ({ dispatch }) => {
  const handleKeydown = action((event: KeyboardEvent) => {
    const input = event.target as HTMLInputElement;
    if (event.code === 'Enter' && input.value) {
      dispatch('enter', {
        title: input.value,
        done: false
      });
      input.value = '';
    }
  });
  return { handleKeydown };
});
