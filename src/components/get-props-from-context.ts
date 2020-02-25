import { Variables } from '../core/variables';
import { Prop } from './prop';

export function getPropsFromContext<T>(context: Variables<T>) {
  const output: Prop<T[keyof T]>[] = [];
  for (const key in context) {
    const item = context[key];
    if (item instanceof Prop) {
      item.name = key;
      output.push(item);
    }
  }
  return output;
}
