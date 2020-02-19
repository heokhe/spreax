export type ParsedFunction = {
  functionName: string;
  parameters: string[];
}

export function parseFunctions(expr: string): ParsedFunction {
  if (!expr.includes('(')) return null;
  let open = false,
    parens = 0,
    currentParameter = '',
    functionName = '';
  const parameters: string[] = [];
  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];
    if (char === ')') {
      parens--;
      if (parens === 0 && currentParameter)
        parameters.push(currentParameter);
    }
    if (parens > 0) {
      if (parens === 1 && char === ',') {
        parameters.push(currentParameter);
        currentParameter = '';
      } else currentParameter += char;
    }
    if (char === '(') {
      open = true;
      parens++;
    }
    if (!open)
      functionName += char;
  }
  if (parens !== 0)
    throw new Error('Brackets are not balanced');
  return { functionName, parameters };
}
