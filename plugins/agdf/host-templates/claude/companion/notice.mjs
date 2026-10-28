// Feedback outside the pane (SDD-05 to SDD-07, AC-004 to AC-006): the shown run as the toast and the
// status line see it, the transition detector, their texts and the generated chime. Judged on the
// run-derived state, never on the turn overlay, so a turn neither flips the status line nor raises a
// toast. Host-independent; the adapter shows the results.

import { assignRun } from './assignment.mjs';
import { gateTitle, label } from './localization.mjs';
import { runState } from './state.mjs';

const NOTICE_MOODS = new Set(['wartet', 'blockiert']);

// What the status line and the detector observe: { kind: 'run', runId, state } with the run-derived
// state, { kind: 'unreadable' } or { kind: 'idle' } (nothing read yet, no control, no shown run).
export function observedRun({ snapshot, sessionStartedAt, selection = null }) {
  if (!snapshot) return { kind: 'idle' };
  if (snapshot.status === 'failed') return { kind: 'unreadable' };
  if (snapshot.status !== 'ok') return { kind: 'idle' };
  const { run } = assignRun({ runs: snapshot.runs, sessionStartedAt, selection });
  if (!run) return selection && snapshot.unreadable.some(item => item.id === selection) ? { kind: 'unreadable' } : { kind: 'idle' };
  const state = runState(run);
  return state.mood === null ? { kind: 'unreadable' } : { kind: 'run', runId: run.id, state };
}

const signature = ({ mood, reason }) => [mood, reason.key, reason.gate ?? '', reason.decision ?? ''].join('|');

// previous: the last observation { runId, signature } or null. A notice is due only when the same
// run's state changed and is now wartet or blockiert; the first observation of a run is a baseline.
// An unreadable state keeps the last observation, so a read in between announces nothing twice.
export function observeNotice(previous, observed) {
  if (observed.kind === 'unreadable') return { observation: previous, notice: null };
  if (observed.kind !== 'run') return { observation: null, notice: null };
  const observation = { runId: observed.runId, signature: signature(observed.state) };
  const changed = previous?.runId === observed.runId && previous.signature !== observation.signature;
  return { observation, notice: changed && NOTICE_MOODS.has(observed.state.mood) ? observed.state : null };
}

// The toast for a notice, e.g. "<run> wartet auf Freigabe: Qualitätssicherung".
export function noticeText(runId, state, { registry, labels, locale }) {
  const t = (path, params) => label(labels, locale, path, params);
  const params = { run: runId, gate: gateTitle(registry, locale, state.reason.gate) };
  if (state.reason.decision) params.decision = t(`decisions.${state.reason.decision}`);
  return t(`notices.${state.reason.key}`, params);
}

// The status line, e.g. "AGDF · QA · wartet"; a completed run names no gate.
export function statusText(observed, { labels, locale }) {
  const t = path => label(labels, locale, path);
  if (observed.kind === 'unreadable') return `AGDF · ${t('statusStates.unreadable')}`;
  if (observed.kind !== 'run') return `AGDF · ${t('statusStates.neutral')}`;
  const { mood, reason } = observed.state;
  return mood === 'fertig' || !reason.gate ? `AGDF · ${t(`statusStates.${mood}`)}` : `AGDF · ${reason.gate} · ${t(`statusStates.${mood}`)}`;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function base64(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += ALPHABET[(n >> 18) & 63] + ALPHABET[(n >> 12) & 63]
      + (i + 1 < bytes.length ? ALPHABET[(n >> 6) & 63] : '=') + (i + 2 < bytes.length ? ALPHABET[n & 63] : '=');
  }
  return out;
}

// A soft two-note chime (0.3 s) as 8 kHz, 8-bit unsigned mono PCM in a RIFF/WAVE container, so no
// audio file ships in the plugin. Hosts without a player skip it (SDD-06).
export const CHIME = Object.freeze({ rate: 8000, notes: Object.freeze([[880, 0.12], [1320, 0.18]]), gain: 0.35 });
let chime = null;
export function chimeClip() {
  if (chime) return chime;
  const samples = [];
  for (const [frequency, seconds] of CHIME.notes) {
    const count = Math.round(CHIME.rate * seconds);
    for (let i = 0; i < count; i += 1) {
      const envelope = Math.min(1, i / 80, (count - i) / 400);
      samples.push(Math.round(128 + 60 * envelope * Math.sin((2 * Math.PI * frequency * i) / CHIME.rate)));
    }
  }
  const bytes = new Uint8Array(44 + samples.length);
  const view = new DataView(bytes.buffer);
  const ascii = (offset, text) => { for (let i = 0; i < text.length; i += 1) bytes[offset + i] = text.charCodeAt(i); };
  ascii(0, 'RIFF'); view.setUint32(4, 36 + samples.length, true); ascii(8, 'WAVE');
  ascii(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, CHIME.rate, true); view.setUint32(28, CHIME.rate, true); view.setUint16(32, 1, true); view.setUint16(34, 8, true);
  ascii(36, 'data'); view.setUint32(40, samples.length, true);
  bytes.set(samples, 44);
  chime = Object.freeze({ base64: base64(bytes), mime: 'audio/wav' });
  return chime;
}
