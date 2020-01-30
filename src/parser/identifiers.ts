const IDENT_START = /[a-z$_]/i;
const IDENT_REST = /^[a-z$_0-9]*$/i;

export const isValidIdentifier = (ident: string) =>
  IDENT_START.test(ident.charAt(0))
  && IDENT_REST.test(ident.slice(1));
