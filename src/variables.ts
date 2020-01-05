import { StateVariable } from './state';
import { ComputedVariable } from './computed';

export type Variable<T> = ComputedVariable<T> | StateVariable<T>;

export type Variables<T> = {
  [x in keyof T]: Variable<T[x]>;
};

export function groupVariables<T, K extends keyof T>(vars: Variables<T>) {
  const stateVars = [] as StateVariable<T[K]>[],
    computedVars = [] as ComputedVariable<T[K]>[];
  for (const varName in vars) {
    const current = vars[varName as keyof T];
    if (current instanceof StateVariable)
      stateVars.push(current);
    else if (current instanceof ComputedVariable)
      computedVars.push(current);
  }
  return { stateVars, computedVars }
}
