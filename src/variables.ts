import { StateVariable } from './state';
import { DerivedVariable } from './derived';

export type Variable<T> = DerivedVariable<T> | StateVariable<T>;

export type Variables<T> = {
  [x in keyof T]: Variable<T[x]>;
};

export function getVariablesFromObject<T>(variables: T): Variable<T[keyof T]>[] {
  return Object.values(variables);
}
