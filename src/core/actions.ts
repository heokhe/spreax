export type Action = <E extends Event>(event?: E) => any;

export type Actions<K extends string> = {
  [x in K]: Action;
}
