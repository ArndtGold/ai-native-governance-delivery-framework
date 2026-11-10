// A caller-supplied candidate is a comparison input, never host attestation.
export function compareCockpitCandidate(actual, candidate) {
  const valid = value => typeof value === 'string' && /^sha256:[a-f0-9]{64}$/.test(value);
  if (!candidate) return 'unverified';
  if (!valid(actual) || !valid(candidate)) return 'invalid';
  return actual === candidate ? 'match' : 'mismatch';
}
