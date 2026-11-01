import { createHash, randomUUID } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import { existsSync, lstatSync, mkdirSync, readdirSync, unlinkSync, openSync, writeFileSync, fsyncSync, closeSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { atomicWrite, fsyncDirectory, withOwnedFileLock } from '../owned-file-lock.js';
import { hasSymlinkComponent, containedRegularFile } from './contained-file.js';
import { exactObject, canonicalJson } from './approval-command-contract.js';
import { REVISION_ID_PATTERN } from './run-identity.js';
import { readContainedControlText } from '../control-read/snapshot.js';
import { currentInputResolution, isOriginalInputResolution, bindInputResolution, resolutionRecord, recordedInputResolution } from './input-resolution.js';

export const PLANNED_LAYOUT = 'planned-urs-v1';
export const LEGACY_LAYOUT = 'master-backlog-v1';
const CONFIG = '.agdf/control/config.json';
const MAINTENANCE = '.agdf/control/maintenance';
const CLAIMS = `${MAINTENANCE}/admission`;
const MARKER = `${MAINTENANCE}/PLANNED_LAYOUT_PENDING.json`;
const active = new AsyncLocalStorage();
export function markControlMutationEffect() {
  const mutation = active.getStore();
  if (mutation) mutation.effectStarted = true;
}
export const currentControlMutationId = () => active.getStore()?.operation_id ?? null;
// Git scope checks may exclude only the active owner's exact transient claims.
// Another operation's files, or replaced claim bytes, remain foreign evidence.
export function currentOwnedMutationClaimPaths(root) {
  const mutation = active.getStore();
  if (mutation?.root !== root) return [];
  const claims = mutation.claim ? [{ path: mutation.claim.path, digest: hash(mutation.claim.text) }] : mutation.recoveryClaims ?? [];
  return claims.map(claim => {
    if (hash(read(root, claim.path, 4096)) !== claim.digest) fail('AGDF_CONTROL_ADMISSION_UNKNOWN');
    return claim.path;
  });
}
export function markControlMutationRollbackKnown(resource) {
  const mutation = active.getStore();
  if (mutation && (!resource || mutation.resource === resource)) mutation.effectStarted = false;
}
const hash = value => 'sha256:' + createHash('sha256').update(value).digest('hex');
const fail = code => { throw Error(code); };

function read(root, path, limit = 65536) {
  if (hasSymlinkComponent(root, path) || containedRegularFile(root, path).status !== 'valid') fail('AGDF_CONTROL_PATH_INVALID');
  return readContainedControlText(root, path, limit);
}

export function readControlLayout(root, { live = false } = {}) {
  const captured = currentInputResolution()?.configuration;
  const original = !live && isOriginalInputResolution() && captured?.root === root && captured.control === 'active' ? captured : null;
  const originalLayout = original?.control_layout ?? LEGACY_LAYOUT;
  const originalSnapshot = () => {
    // The existing original-operation proof binds the captured configuration.
    // Historical resolved/1 records predate layout selection and mean legacy;
    // new records retain the explicit layout. Current corrupt config must not
    // veto recovery or silently select a different layout for that operation.
    if (![LEGACY_LAYOUT, PLANNED_LAYOUT].includes(originalLayout)) fail('AGDF_CONTROL_LAYOUT_UNSUPPORTED');
    return Object.freeze({ layout: originalLayout, generation: original.config_digest, config: null });
  };
  const text = read(root, CONFIG);
  let config;
  try { config = JSON.parse(text.replace(/^\uFEFF/u, '')); } catch { if (original) return originalSnapshot(); fail('AGDF_CONTROL_LAYOUT_INVALID'); }
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    if (original) return originalSnapshot(); fail('AGDF_CONTROL_LAYOUT_INVALID');
  }
  const layout = config.control_layout ?? LEGACY_LAYOUT;
  if (![LEGACY_LAYOUT, PLANNED_LAYOUT].includes(layout)) fail('AGDF_CONTROL_LAYOUT_UNSUPPORTED');
  // Physical cutover wins over a historical operation's old configuration.
  // Within the same layout, original recovery retains its already-bound choices.
  return Object.freeze({ layout, generation: original && layout === originalLayout ? original.config_digest : hash(text), config });
}

export function assertLayoutRunWrite(root, state) {
  const layout = readControlLayout(root);
  const version = Number(state.meta.control_state_version);
  if (version !== (layout.layout === PLANNED_LAYOUT ? 3 : 2)) fail('AGDF_CONTROL_LAYOUT_MIGRATION_REQUIRED');
  return layout;
}

function ensureDirectory(root, path) {
  if (hasSymlinkComponent(root, path)) fail('AGDF_CONTROL_PATH_INVALID');
  const file = join(root, path);
  if (!existsSync(file)) {
    try { mkdirSync(file, { mode: 0o700 }); fsyncDirectory(dirname(file)); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
  const stat = lstatSync(file);
  if (!stat.isDirectory() || stat.isSymbolicLink()) fail('AGDF_CONTROL_PATH_INVALID');
}

function ensureAdmission(root) {
  ensureDirectory(root, MAINTENANCE); ensureDirectory(root, CLAIMS);
}

function markerPresent(root) {
  // A malformed or foreign marker freezes admission as well. Readers never repair it.
  if (hasSymlinkComponent(root, MARKER)) fail('AGDF_CONTROL_PATH_INVALID');
  return existsSync(join(root, MARKER));
}

function publishClaim(root, relative, text) {
  // Exclusive publication cannot replace an unknown pre-existing claim.
  const path = join(root, relative), fd = openSync(path, 'wx', 0o600);
  try { writeFileSync(fd, text); fsyncSync(fd); } finally { closeSync(fd); }
  fsyncDirectory(dirname(path));
}

function retireClaim(root, claim) {
  if (read(root, claim.path, 4096) !== claim.text) fail('AGDF_CONTROL_ADMISSION_UNKNOWN');
  unlinkSync(join(root, claim.path)); fsyncDirectory(join(root, CLAIMS));
}

// Call after the resource lock, before publishing any product effect. Independent
// claims have no shared exclusive lock. Nested owners retain the outer admission.
export function withControlMutation(root, { resource, operation_id = null, checkpoint = () => {}, resume = false, proveOutcome } = {}, work) {
  const inherited = active.getStore();
  if (inherited?.root === root) return work(inherited.layout);
  if (typeof resource !== 'string' || !resource || resource.length > 512) fail('AGDF_CONTROL_RESOURCE_INVALID');
  if (operation_id !== null && !REVISION_ID_PATTERN.test(operation_id)) fail('AGDF_CONTROL_RESOURCE_INVALID');
  ensureAdmission(root);
  if (resume && operation_id && inspectMutationClaims(root, { strict: false }).some(row => row.resource === resource && row.operation_id === operation_id))
    return withControlRecovery(root, { resource, operation_id, proveOutcome }, work);
  const layout = readControlLayout(root);
  if (markerPresent(root)) fail('AGDF_CONTROL_MAINTENANCE_REQUIRED');
  checkpoint('before_claim');
  const id = randomUUID(), path = `${CLAIMS}/${id}.json`;
  const text = JSON.stringify({ schema_version: 1, id, resource, operation_id, generation: layout.generation, pid: process.pid }) + '\n';
  const claim = { path, text };
  publishClaim(root, path, text);
  let admitted = false;
  const mutation = { root, layout, claim, resource, operation_id, effectStarted: false };
  try {
    checkpoint('claim_published');
    if (markerPresent(root) || readControlLayout(root).generation !== layout.generation) fail('AGDF_CONTROL_MAINTENANCE_REQUIRED');
    admitted = true;
    checkpoint('admitted');
    const result = active.run(mutation, () => work(layout));
    if (result && typeof result.then === 'function') fail('AGDF_CONTROL_ASYNC_MUTATION_UNSUPPORTED');
    const observed = result?.rejection ?? result;
    if (mutation.effectStarted && (['recovery_required', 'effect_unknown'].includes(observed?.outcome)
      || /recovery_required|effect_unknown/u.test(observed?.reason ?? ''))) {
      return { ...result, admission_claim: { path, digest: hash(text) } };
    }
    retireClaim(root, claim);
    return result;
  } catch (error) {
    // Known rollback/rejection may retire. An uncertain transaction keeps its claim
    // until the original operation is explicitly recovered and its outcome proven.
    const uncertain = admitted && mutation.effectStarted;
    if (uncertain) error.admission_claim = { path, digest: hash(text) };
    else retireClaim(root, claim);
    throw error;
  }
}

export function inspectMutationClaims(root, { strict = true } = {}) {
  if (hasSymlinkComponent(root, CLAIMS)) fail('AGDF_CONTROL_PATH_INVALID');
  if (!existsSync(join(root, CLAIMS))) return [];
  if (!lstatSync(join(root, CLAIMS)).isDirectory()) fail('AGDF_CONTROL_PATH_INVALID');
  const names = readdirSync(join(root, CLAIMS));
  if (names.length > 4096) fail('AGDF_CONTROL_ADMISSION_UNKNOWN');
  return names.sort().map(name => {
    try {
    if (!/^[0-9a-f-]{36}\.json$/u.test(name)) fail('AGDF_CONTROL_ADMISSION_UNKNOWN');
    const path = `${CLAIMS}/${name}`, text = read(root, path, 4096);
    let claim; try { claim = JSON.parse(text); } catch { fail('AGDF_CONTROL_ADMISSION_UNKNOWN'); }
    if (!exactObject(claim, ['schema_version', 'id', 'resource', 'operation_id', 'generation', 'pid']) || claim.schema_version !== 1
      || !REVISION_ID_PATTERN.test(claim.id) || name !== `${claim.id}.json` || typeof claim.resource !== 'string'
      || !claim.resource || claim.resource.length > 512 || !/^sha256:[a-f0-9]{64}$/u.test(claim.generation)
      || claim.operation_id !== null && !REVISION_ID_PATTERN.test(claim.operation_id)
      || !Number.isSafeInteger(claim.pid) || claim.pid <= 0) fail('AGDF_CONTROL_ADMISSION_UNKNOWN');
    return { ...claim, path, digest: hash(text) };
    } catch (error) { if (strict) throw error; return null; }
  }).filter(Boolean);
}

// An original admitted operation may finish while maintenance is draining it.
// This does not admit new effects: the caller holds its resource lock and must
// prove the original transaction's exact recorded or rolled-back outcome.
export function withControlRecovery(root, { resource, operation_id, proveOutcome }, work) {
  if (!REVISION_ID_PATTERN.test(operation_id) || typeof proveOutcome !== 'function') fail('AGDF_CONTROL_ADMISSION_UNKNOWN');
  const claims = inspectMutationClaims(root, { strict: false }).filter(row => row.resource === resource && row.operation_id === operation_id);
  if (!claims.length) return withControlMutation(root, { resource, operation_id }, work);
  const layout = readControlLayout(root);
  if (claims.some(row => row.generation !== layout.generation)) fail('AGDF_CONTROL_ADMISSION_UNKNOWN');
  const result = active.run({ root, layout, resource, operation_id, recoveryClaims: claims, effectStarted: false }, work);
  if (result && typeof result.then === 'function' || proveOutcome(result) !== true) fail('AGDF_CONTROL_ADMISSION_UNKNOWN');
  for (const claim of claims) retireRecoveredMutationClaim(root, { ...claim, proveOutcome: () => true });
  return result;
}

// No timeout/liveness heuristic removes claims. The recovery owner supplies proof
// of the original operation's known outcome and the exact inspected claim bytes.
export function retireRecoveredMutationClaim(root, { path, digest, proveOutcome }) {
  const observed = inspectMutationClaims(root, { strict: false }).find(row => row.path === path && row.digest === digest);
  if (!observed || typeof proveOutcome !== 'function' || proveOutcome(observed) !== true) fail('AGDF_CONTROL_ADMISSION_UNKNOWN');
  const text = read(root, path, 4096);
  if (hash(text) !== digest) fail('AGDF_CONTROL_ADMISSION_UNKNOWN');
  retireClaim(root, { path, text });
}

// Maintenance retains the marker on interruption or undrained claims. A matching
// original operation can resume under the rare exclusive epoch lock.
export function inspectLayoutMaintenance(root) {
  if (!markerPresent(root)) return { state: 'none', authorizes: false };
  try {
    const text = read(root, MARKER, 16384), stored = JSON.parse(text), marker = resolutionRecord(stored);
    const fields = ['schema_version', 'operation_id', 'request_digest', ...(marker?.schema_version === 2 ? ['preview_digest', 'config_digest'] : [])];
    if (!exactObject(marker, fields) || ![1, 2].includes(marker.schema_version) || !REVISION_ID_PATTERN.test(marker.operation_id)
      || !/^sha256:[a-f0-9]{64}$/u.test(marker.request_digest) || marker.schema_version === 2
        && ![marker.preview_digest, marker.config_digest].every(value => /^sha256:[a-f0-9]{64}$/u.test(value))) fail('AGDF_CONTROL_MAINTENANCE_UNKNOWN');
    return { state: 'pending', marker, stored, digest: hash(text), input_resolution: recordedInputResolution(stored), authorizes: false };
  } catch { return { state: 'unknown', authorizes: false }; }
}

export function withLayoutMaintenance(root, { operation_id, request_digest, preview_digest, config_digest, checkpoint = () => {} }, work) {
  if (!REVISION_ID_PATTERN.test(operation_id) || !/^sha256:[a-f0-9]{64}$/u.test(request_digest)) fail('AGDF_CONTROL_MAINTENANCE_INVALID');
  if (preview_digest !== undefined && ![preview_digest, config_digest].every(value => /^sha256:[a-f0-9]{64}$/u.test(value))) fail('AGDF_CONTROL_MAINTENANCE_INVALID');
  ensureAdmission(root);
  return withOwnedFileLock(join(root, MAINTENANCE, 'EPOCH'), () => {
    const marker = { schema_version: preview_digest === undefined ? 1 : 2, operation_id, request_digest,
      ...(preview_digest === undefined ? {} : { preview_digest, config_digest }) };
    let text;
    if (markerPresent(root)) {
      const previous = inspectLayoutMaintenance(root);
      if (previous.state !== 'pending' || canonicalJson(previous.marker) !== canonicalJson(marker)) fail('AGDF_CONTROL_MAINTENANCE_UNKNOWN');
      text = read(root, MARKER, 16384);
    } else { text = JSON.stringify(bindInputResolution(marker)) + '\n'; atomicWrite(join(root, MARKER), text); }
    checkpoint('maintenance_frozen');
    if (inspectMutationClaims(root).length) fail('AGDF_CONTROL_MUTATIONS_IN_FLIGHT');
    checkpoint('maintenance_drained');
    const result = work(readControlLayout(root, { live: true }));
    if (result && typeof result.then === 'function') fail('AGDF_CONTROL_ASYNC_MUTATION_UNSUPPORTED');
    if (read(root, MARKER, 16384) !== text) fail('AGDF_CONTROL_MAINTENANCE_UNKNOWN');
    unlinkSync(join(root, MARKER)); fsyncDirectory(join(root, MAINTENANCE));
    return result;
  });
}
