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