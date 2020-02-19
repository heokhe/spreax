import { constant, Constant } from './constant';

export type ActionFn<E extends Event = Event> = (event?: E, ...args: any[]) => any;
export type ActionVariable<E extends Event = Event> = Constant<ActionFn<E>>

export const action = <E extends Event = Event>(
  callback: ActionFn<E>
): ActionVariable<E> => constant(callback);
