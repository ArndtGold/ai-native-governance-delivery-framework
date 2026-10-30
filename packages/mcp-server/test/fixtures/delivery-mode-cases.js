// Shared test inventory only; these selectors never change delivery policy.
export const DELIVERY_PROTOCOLS = Object.freeze(['legacy', 'modern']);
export const STRUCTURED_ROUTES = Object.freeze(['structured_delivery', 'structured_slice']);
export const STRUCTURED_CASES = Object.freeze(DELIVERY_PROTOCOLS.flatMap(protocol =>
  STRUCTURED_ROUTES.map(route => Object.freeze({ protocol, modern: protocol === 'modern', route }))));

export function deliveryModeCases(args, { structured = false } = {}) {
  const selected = {};
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i], value = args[i + 1];
    if (!['--protocol', ...(structured ? ['--route'] : [])].includes(flag) || !value || Object.hasOwn(selected, flag)) throw Error('invalid_delivery_test_selector');
    selected[flag] = value;
  }
  if (selected['--protocol'] && !DELIVERY_PROTOCOLS.includes(selected['--protocol'])
    || selected['--route'] && !STRUCTURED_ROUTES.includes(selected['--route'])) throw Error('invalid_delivery_test_selector');
  const cases = structured ? STRUCTURED_CASES : DELIVERY_PROTOCOLS.map(protocol => ({ protocol, modern: protocol === 'modern' }));
  return cases.filter(row => (!selected['--protocol'] || row.protocol === selected['--protocol'])
    && (!selected['--route'] || row.route === selected['--route']));
}
