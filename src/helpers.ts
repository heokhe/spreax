export const checkAndCast = <T>(object: T, key: string) => 
  key in object ? key as keyof T : undefined;