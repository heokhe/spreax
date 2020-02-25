import { Subscribable } from './subscribable';
import { DerivedVariable } from './derived';

export type Variable<T> = Subscribable<T>;

export type Variables<T> = {
  [x in keyof T]: Variable<T[x]>;
};

export function getVariablesFromObject<T>(variables: T): Variable<T[keyof T]>[] {
  return Object.values(variables);
}

export function autoComputeAllDerivedVars<T>(variables: Variables<T>) {
  const variablesArray = getVariablesFromObject(variables);
  for (const v1 of variablesArray)
    if (v1 instanceof DerivedVariable)
      for (const v2 of variablesArray)
        if (v2 !== v1)
          v1.subscribeAndAutoCompute(v2);
}
