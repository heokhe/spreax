import { Subscribable } from './subscribable';

export type Variable<T> = Subscribable<T>;

export type Variables<T> = {
  [x in keyof T]: Variable<T[x]>;
};

export function getVariablesFromObject<T>(variables: T): Variable<T[keyof T]>[] {
  return Object.values(variables);
}
