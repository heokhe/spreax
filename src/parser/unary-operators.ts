export type UnaryOperator = '!' | '+' | '-';
export const UNARY_OPERATORS = ['!', '+', '-'];

export function applyOperators(value: any, operators: UnaryOperator[]) {
  let val = value;
  for (const op of operators) {
    // eslint-disable-next-line default-case
    switch (op) {
      case '!':
        val = !val;
        break;
      case '+':
        val = +val;
        break;
      case '-':
        val = -val;
        break;
    }
  }
  return val;
}
