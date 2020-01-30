export const checkAndCast = <T>(object: T, key: string) => 
  key && key in object ? key as keyof T : undefined;


type Fn<T, U> = (x: T) => U;
export function memoize<T, U>(fn: Fn<T, U>): Fn<T, U> {
  const cache = new Map<T, U>();
  return (x: T) => {
    if (!cache.has(x)) 
      cache.set(x, fn(x));
    return cache.get(x);
  }
}

export function flatUnique<T>(array: T[][]): T[] {
  const output = [];
  for (const a of array)
    for (const b of a)
      if (!output.includes(b))
        output.push(b);
  return output;
}