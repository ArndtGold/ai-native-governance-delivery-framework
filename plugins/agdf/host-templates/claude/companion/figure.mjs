// Shared, self-contained artwork for the Companion and Cockpit. Core supplies the Run state.
export const VIEW = Object.freeze({ width: 200, height: 140 });

const SIGNAL = Object.freeze({
  laeuft: '#a8d9ff',
  baut: '#88f3ee',
  wartet: '#ffd080',
  blockiert: '#ff9b8c',
  fertig: '#b8f5ad',
  bereit: '#d0e4eb',
});
// Static shapes remain legible when reduced motion is requested; colors remain supplemental.
const FACES = Object.freeze({
  bereit:    { x: [62, 101], y: [52, 52], ry: [3.5, 3.5], mouth: 'M74 65h14', brow: '' },
  laeuft:    { x: [64, 103], y: [52, 52], ry: [4, 4], mouth: 'M75 64q6 3 12 0', brow: '' },
  baut:      { x: [66, 105], y: [52, 52], ry: [3.5, 3.5], mouth: 'M74 64q7 3 14 0', brow: 'M54 47q7-1 14 0 M94 47q7-1 14 0' },
  wartet:    { x: [62, 101], y: [52, 52], ry: [4, 4], mouth: 'M75 64q6 2 12 0', brow: 'M55 45q5-3 12 0' },
  blockiert: { x: [66, 105], y: [52, 52], ry: [4.5, 4.5], mouth: 'M75 66q6-3 12 0', brow: 'M54 46q6-2 13 0 M94 46q6-2 13 0' },
  fertig:    { x: [62, 101], y: [52, 52], ry: [2.5, 2.5], mouth: 'M73 62q8 9 16 0', brow: '' },
});
// A friendly, closed smile for the ready figure; softer than the open smile of `fertig`.
const IDLE_SMILE = 'M74 63q7 6 14 0';
const GESTURES = new Set(['baut', 'wartet', 'blockiert', 'fertig']);
const GATES = new Set(['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT', 'OR']);

export function observeFigure(previous, { scope, figure, current }) {
  if (!scope || !figure || !Object.hasOwn(SIGNAL, figure.mood)) return null;
  const { mood, reason } = figure;
  const state = JSON.stringify([scope, mood, reason?.key, reason?.gate, reason?.decision, current]);
  if (previous?.state === state) return previous;
  const gate = reason?.key === 'waitingApproval' && GATES.has(reason.gate) ? reason.gate : undefined;
  const changed = previous?.mood !== mood || (mood === 'wartet' && previous?.gate !== gate);
  const sameScope = previous?.scope === scope;
  const firstGesture = GESTURES.has(mood) && (!sameScope || !previous.seenCurrent);
  const transition = previous?.current && previous.scope === scope && changed && GESTURES.has(mood);
  const gesture = Boolean(current && (firstGesture || transition));
  const seenCurrent = Boolean(current || (sameScope && previous.seenCurrent));
  return { scope, state, current, mood, gate, gesture, seenCurrent, sequence: (previous?.sequence ?? 0) + 1 };
}

const escape = text => String(text).replace(/[&<>"]/gu, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);
const motion = (type, values, duration, keyTimes = '0;0.5;1') =>
  `<animateTransform attributeName="transform" type="${type}" values="${values}" keyTimes="${keyTimes}" dur="${duration}s" repeatCount="1"/>`;

function arm(mood, gesture, planning) {
  const pivot = '112 95';
  const angles = { baut: [-10, -52, 12, -52, -10], wartet: [-10, -34, -20, -34, -10], blockiert: [-10, -50, -28, -50, -10], fertig: [-10, 15, -2, 15, -10] }[mood] ?? [-10];
  const movement = gesture && angles.length > 1
    ? motion('rotate', angles.map(angle => `${angle} ${pivot}`).join(';'), 2.4, '0;0.2;0.5;0.75;1')
    : '';
  const torqueWrench = mood === 'baut' && !planning
    ? `<g data-tool="torque-wrench">
      <rect x="149" y="53" width="6" height="43" rx="3" fill="url(#metal)" stroke="#546d7a"/>
      <rect x="148" y="78" width="8" height="15" rx="3" fill="#29434b"/>
      <path d="M149 82h6m-6 4h6" stroke="#89c9c6" stroke-width="1"/>
      <circle cx="152" cy="52" r="7" fill="url(#metal)" stroke="#546d7a" stroke-width="1.3"/>
      <path d="M150 48h4l2 4-2 4h-4l-2-4z" fill="#334852" stroke="#d5e5e9" stroke-width=".7"/>
    </g>`
    : '';
  const flagMotion = gesture && mood === 'fertig' ? motion('rotate', '0 151 95;-9 151 95;9 151 95;-9 151 95;0 151 95', 2.4, '0;0.2;0.5;0.75;1') : '';
  const finishFlag = mood === 'fertig' ? `<g data-accessory="finish-flag">${flagMotion}
    <path d="M151 95V42" fill="none" stroke="#546d7a" stroke-width="3" stroke-linecap="round"/>
    <rect x="152" y="42" width="26" height="18" rx="1.5" fill="#f8fcff" stroke="#546d7a" stroke-width="1"/>
    <path d="M152 42h6.5v6H152z M165 42h6.5v6H165z M158.5 48h6.5v6h-6.5z M171.5 48h6.5v6h-6.5z M152 54h6.5v6H152z M165 54h6.5v6H165z" fill="#25343d"/>
  </g>` : '';
  return `<g transform="rotate(${angles[0]} ${pivot})">${movement}${torqueWrench}${finishFlag}
    <rect x="106" y="88" width="45" height="14" rx="7" fill="url(#metal)" stroke="#546d7a"/>
    <circle cx="115" cy="95" r="4" fill="#243644" stroke="#adc3cb"/>
    <rect x="143" y="86" width="15" height="18" rx="5" fill="url(#metal)" stroke="#546d7a"/>
  </g>`;
}

function accessory(mood, gate, gesture) {
  if (mood === 'wartet' && gate) {
    const raise = gesture ? motion('translate', '-2 5;0 -2;0 0', 2.4) : '';
    const sway = gesture ? motion('rotate', '0 160 86;-8 160 86;8 160 86;-8 160 86;0 160 86', 2.4, '0;0.2;0.5;0.75;1') : '';
    return `<g>${raise}<g>${sway}<g transform="rotate(-7 160 86)">
      <rect x="131" y="74" width="60" height="24" rx="6" fill="#fff6e4" stroke="#995a25" stroke-width="1.2"/>
      <text x="161" y="90" text-anchor="middle" fill="#774100" font-size="13" font-weight="700" font-family="sans-serif">${gate}</text>
    </g></g></g>`;
  }
  if (mood === 'blockiert') {
    const alert = gesture ? '<animateTransform attributeName="transform" type="rotate" values="0 0 0;360 0 0" keyTimes="0;1" calcMode="spline" keySplines=".42 0 .58 1" dur="1s" repeatCount="1"/>' : '';
    return `<g transform="translate(162 49)"><g>${alert}
      <path d="M-3 -13 Q0 -17 3 -13 L16 9 Q18 13 13 13 H-13 Q-18 13 -16 9Z" fill="#3b2830" stroke="#ff9b8c" stroke-width="2"/>
      <path d="M0 -6 V3" stroke="#ff9b8c" stroke-width="3" stroke-linecap="round"/><circle cy="8" r="1.6" fill="#ff9b8c"/>
    </g></g>`;
  }
  if (mood === 'baut' && gesture) {
    return '<path d="M165 102v-9m-5 5h10m4-8 4-4" fill="none" stroke="#88f3ee" stroke-width="2" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;1;0;1;0" dur="2.4s" repeatCount="1"/></path>';
  }
  return '';
}

// A plan is a contextual prop, not a claim that a task or review has passed.
// The overview tablet: a crew member looking at the board, no run state. Three independent cycles with
// pairwise coprime lengths (17 s tap, 23 s scroll, 29 s lift) overlap with the blink (12 s) and the head
// (31 s), so the motion stays irregular without randomness: an unchanged read keeps the same SVG bytes.
function tabletAccessory(still) {
  const lift = still ? '' : '<animateTransform attributeName="transform" type="rotate" values="-8 151 82;-8 151 82;-11 151 82;-10 151 82;-8 151 82;-8 151 82" keyTimes="0;0.41;0.44;0.5;0.54;1" dur="29s" repeatCount="indefinite"/>';
  // A double tap early in the cycle, a single tap late, uneven pauses in between.
  const tap = still ? '' : '<animateTransform attributeName="transform" type="translate" values="0 0;0 0;-3 -3;0 0;-3 -3;0 0;0 0;-3 -3;0 0;0 0" keyTimes="0;0.3;0.315;0.33;0.345;0.36;0.78;0.795;0.81;1" dur="17s" repeatCount="indefinite"/>';
  // The screen scrolls one line, then the page quietly refreshes.
  const scroll = still ? '' : '<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -5;0 -5;0 0" keyTimes="0;0.62;0.66;0.97;1" dur="23s" repeatCount="indefinite"/>'
    + '<animate attributeName="opacity" values="1;1;0;1" keyTimes="0;0.96;0.98;1" dur="23s" repeatCount="indefinite"/>';
  return `<g data-accessory="overview-tablet" transform="rotate(-8 151 82)">${lift}
    <clipPath id="tablet-screen"><rect x="136" y="65" width="35" height="27" rx="2"/></clipPath>
    <rect x="132" y="61" width="43" height="36" rx="5" fill="#213a43" stroke="#a9c3ca" stroke-width="2"/>
    <rect x="136" y="65" width="35" height="27" rx="2" fill="#416a6c"/>
    <g clip-path="url(#tablet-screen)"><g>${scroll}<path d="M141 72h20M141 77h15M141 82h18M141 87h12M141 92h17" stroke="#9edbd1" stroke-width="1.5" stroke-linecap="round"/></g></g>
    <g>${tap}<rect x="135" y="86" width="13" height="9" rx="4" fill="url(#metal)" stroke="#41616a" stroke-width="1.5"/></g>
  </g>`;
}

function planAccessory(still, showcase = false) {
  const movement = still ? '' : showcase ? '<animateTransform attributeName="transform" type="rotate" values="0 155 80;-7 155 80;7 155 80;-4 155 80;0 155 80;0 155 80" keyTimes="0;0.12;0.26;0.38;0.5;1" dur="4s" repeatCount="indefinite"/>' : '<animateTransform attributeName="transform" type="rotate" values="0 155 80;0 155 80;-3 155 80;0 155 80;0 155 80" keyTimes="0;0.71;0.74;0.77;1" dur="29s" repeatCount="indefinite"/>';
  const pen = still ? '' : showcase ? '<animateTransform attributeName="transform" type="translate" values="0 0;3 -3;0 0;0 0" keyTimes="0;0.18;0.36;1" dur="4s" repeatCount="indefinite"/>' : '<animateTransform attributeName="transform" type="translate" values="0 0;0 0;2 -2;0 0;0 0" keyTimes="0;0.73;0.75;0.78;1" dur="29s" repeatCount="indefinite"/>';
  return `<g data-accessory="tp-plan" transform="rotate(-6 157 81)">${movement}
    <rect x="127" y="54" width="62" height="49" rx="6" fill="#25454b" stroke="#a9c3cb" stroke-width="2"/>
    <rect x="132" y="59" width="52" height="39" rx="3" fill="#e8f4ed"/>
    <rect x="136" y="63" width="20" height="11" rx="3" fill="#c9e8dc"/>
    <text x="146" y="71" text-anchor="middle" fill="#17544e" font-size="8" font-weight="700" font-family="sans-serif">TP</text>
    <path d="M139 79h3m4 0h26m-33 6h3m4 0h23m-30 6h3m4 0h20" fill="none" stroke="#4d867b" stroke-width="1.5" stroke-linecap="round"/>
    <g data-tool="planning-pen">${pen}<path d="M170 93l10-14" stroke="#243e48" stroke-width="3" stroke-linecap="round"/><path d="M170 93l-2 3" stroke="#d59751" stroke-width="2" stroke-linecap="round"/><rect x="174" y="87" width="11" height="8" rx="4" fill="url(#metal)" stroke="#546d7a" stroke-width="1"/></g>
  </g>`;
}

export function figureSvg(mood, { still = false, title = '', gate, workGate, gesture = false, sequence = 0, showcase = false, smile = false, tablet = false } = {}) {
  const planning = workGate === 'TP';
  const signal = SIGNAL[mood] ?? SIGNAL.bereit;
  // A ready figure without a run to show may smile; it is a face only, never a run state.
  const face = smile && mood === 'bereit' ? { ...FACES.bereit, mouth: IDLE_SMILE } : FACES[mood] ?? FACES.bereit;
  const act = gesture && !still;
  const eye = index => {
    const ry = face.ry[index];
    const blink = still ? '' : showcase ? `<animate attributeName="ry" values="${ry};${ry};0.55;${ry};${ry}" keyTimes="0;0.2;0.23;0.27;1" dur="4s" repeatCount="indefinite"/>` : `<animate attributeName="ry" values="${ry};${ry};0.55;${ry};${ry}" keyTimes="0;0.965;0.973;0.983;1" dur="12s" repeatCount="indefinite"/>`;
    return `<ellipse cx="${face.x[index]}" cy="${face.y[index]}" rx="8" ry="${ry}">${blink}</ellipse>`;
  };
  // Two small head movements are separated by unequal, long pauses; no motion in a still pose.
  const idleHead = still ? '' : '<animateTransform attributeName="transform" type="rotate" values="0 82 82;0 82 82;3 82 82;0 82 82;0 82 82;-2 82 82;0 82 82;0 82 82" keyTimes="0;0.22;0.235;0.25;0.71;0.725;0.74;1" dur="31s" repeatCount="indefinite"/>';
  const headBase = mood === 'wartet' ? 'rotate(3 82 82)' : 'rotate(0 82 82)';
  const headTilt = act && mood === 'wartet' ? motion('rotate', '3 82 82;6 82 82;3 82 82', 2.4)
    : act && mood === 'fertig' ? motion('rotate', '0 82 82;7 82 82;0 82 82', 2.4) : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW.width} ${VIEW.height}" width="${VIEW.width}" height="${VIEW.height}"${act && Number.isSafeInteger(sequence) ? ` data-gesture="${sequence}"` : ''}>
  <title>${escape(title)}</title>
  <defs>
    <linearGradient id="metal" x2="88%" y2="100%">
      <stop stop-color="#f8fcff"/><stop offset=".55" stop-color="#adc3cb"/><stop offset="1" stop-color="#546d7a"/>
    </linearGradient>
    <linearGradient id="visor" x2="66%" y2="100%"><stop stop-color="#425763"/><stop offset=".64" stop-color="#1c2d3b"/><stop offset="1" stop-color="#0f1a25"/></linearGradient>
    <linearGradient id="glint"><stop stop-color="#f8fcff" stop-opacity="0"/><stop offset=".5" stop-color="#f8fcff" stop-opacity=".53"/><stop offset="1" stop-color="#f8fcff" stop-opacity="0"/></linearGradient>
    <radialGradient id="shadow"><stop stop-color="#111f31" stop-opacity=".38"/><stop offset="1" stop-color="#111f31" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="88" cy="126" rx="64" ry="11" fill="url(#shadow)"/>
  ${arm(mood, act, planning)}
  <g fill="url(#metal)" stroke="#546d7a" stroke-width="1.4">
    <rect x="53" y="113" width="24" height="11" rx="4"/>
    <rect x="91" y="113" width="24" height="11" rx="4"/>
    <rect x="50" y="76" width="67" height="42" rx="16"/>
  </g>
  <g data-crew="vest">
    <path d="M54 85 65 81 82 91 100 81 113 85 113 108 Q112 115 105 116 H61 Q54 115 54 108Z" fill="#284d53" stroke="#173942" stroke-width="1"/>
    <path d="M60 85 68 83 77 91 71 95 60 91Z M104 85 97 83 88 91 94 95 104 91Z" fill="#77c8bd"/>
    <path d="M57 105h11 M100 105h10" stroke="#c9ebd9" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M57 111h53" stroke="#65b3aa" stroke-width="1.2" opacity=".85"/>
  </g>
  <rect x="71" y="91" width="26" height="13" rx="4" fill="#1c2d3b" stroke="#546d7a"/>
  <path d="M77 97h3m3 0h3m3 0h3" stroke="${signal}" stroke-width="3" stroke-linecap="round"/>
  <g>${idleHead}<g transform="${headBase}">${headTilt}
    <path d="M57 23 51 9" stroke="#546d7a" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="51" cy="9" r="4.5" fill="${signal}" stroke="#546d7a"/>
    <rect x="123" y="43" width="17" height="24" rx="7" fill="url(#metal)" stroke="#546d7a" stroke-width="1.4"/>
    <rect x="32" y="22" width="99" height="63" rx="22" fill="url(#metal)" stroke="#546d7a" stroke-width="1.4"/>
    <g data-crew="headset">
      <path d="M30 47 Q24 17 53 17 H109 Q136 17 135 47" fill="none" stroke="#234d54" stroke-width="5" stroke-linecap="round"/>
      <path d="M35 30 Q40 20 53 20 H109 Q124 20 130 30" fill="none" stroke="#83c7bd" stroke-width="1.8" stroke-linecap="round"/>
      <rect x="24" y="40" width="12" height="25" rx="6" fill="#26535a" stroke="#163940" stroke-width="1.2"/>
      <rect x="128" y="40" width="12" height="25" rx="6" fill="#26535a" stroke="#163940" stroke-width="1.2"/>
      <path d="M29 61 Q29 76 50 76" fill="none" stroke="#234d54" stroke-width="3" stroke-linecap="round"/>
      <rect x="47" y="73" width="10" height="6" rx="3" fill="#24464d" stroke="#83c7bd" stroke-width=".8"/>
    </g>
    <path d="M48 28q6-3 14-3h38" stroke="#f8fcff" stroke-width="1.5" fill="none" opacity=".8"/>
    <rect x="41" y="33" width="81" height="41" rx="13" fill="url(#visor)" stroke="#546d7a" stroke-width="1.3"/>
    <path d="M49 39h65" stroke="url(#glint)" stroke-width="1.4"/>
    <g fill="${signal}" stroke="${signal}" stroke-opacity=".25" stroke-width="2.5">
      ${eye(0)}
      ${eye(1)}
    </g>
    <path d="${face.mouth}" fill="none" stroke="${signal}" stroke-width="1.8" stroke-linecap="round"/>
    ${face.brow ? `<path d="${face.brow}" fill="none" stroke="${signal}" stroke-width="1.4" stroke-linecap="round"/>` : ''}
  </g></g>
  ${accessory(mood, !planning && GATES.has(gate) ? gate : undefined, act)}
  ${planning ? planAccessory(still, showcase) : ''}
  ${tablet && !planning ? tabletAccessory(still) : ''}
</svg>`;
}

// The terminal has no Svg: a short face stands for the figure there.
export const FIGURE_TEXT = Object.freeze({
  laeuft: '(o_o) …',
  baut: '(o_o) ⚒',
  wartet: '(-_-) ⧗',
  blockiert: '(x_x) !',
  fertig: '(^_^) ✓',
  bereit: '(·_·)',
});
