import { constant, Constant } from './constant';

export type ActionFn<E extends Event = Event> = (arg?: any, event?: E) => any;
export type ActionVariable<E extends Event = Event> = Constant<ActionFn<E>>

export const action = <E extends Event = Event>(
  callback: ActionFn<E>
): ActionVariable<E> => constant(callback);
