/**
 * @param {string} lit
 * @returns {{done: boolean, value?: string|number|boolean|null|void}}
 */
export default function (lit) {
  const done = v => ({ done: true, value: v });
  if (/^[-+]?\d+(?:\.\d*)?$/.test(lit)) {
    return done(+lit);
  } if (/^(['"`]).*\1$/.test(lit)) {
    return done(lit.slice(1, -1));
  } if (/^:[a-z]*$/.test(lit)) {
    return done(lit.slice(1));
  } if (lit === 'true') {
    return done(true);
  } if (lit === 'false') {
    return done(false);
  } if (lit === 'undefined') {
    return done(undefined);
  } if (lit === 'null') {
    return done(null);
  } if (lit === 'Infinity') {
    return done(Infinity);
  }
  return { done: false };
}
