export function pascalToKebab(str: string): string {
  return str
    .replace(/([^^])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

export function kebabToPascal(str: string): string {
  return str
    .replace(/(?:^|-)(.)/g, (_, l) => l.toUpperCase());
}
