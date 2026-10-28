// The companion figure (SDD-09, AC-010): an SVG document per mood. Accessories are drawn only inside
// ACCESSORY_REGION, which lies outside FIGURE_BOX (the figure's extent including its motion), so no
// accessory can cover the figure. The still pose emits no animation element at all.

export const VIEW = Object.freeze({ width: 200, height: 140 });
// Body, ears, feet and shadow span x 34..126, y 26..134; motion adds up to 7 px sideways and 10 px upwards.
export const FIGURE_BOX = Object.freeze({ x: 20, y: 8, width: 120, height: 132 });
export const ACCESSORY_REGION = Object.freeze({ x: 148, y: 8, width: 48, height: 48 });
// Each accessory's extent in region coordinates, including its strokes and motion.
export const ACCESSORY_BOUNDS = Object.freeze({
  laeuft: { x: 8, y: 20, width: 32, height: 8 },
  baut: { x: 1, y: 16, width: 45, height: 31 },
  wartet: { x: 8, y: 8, width: 32, height: 32 },
  blockiert: { x: 6, y: 6, width: 36, height: 36 },
  fertig: { x: 1, y: 1, width: 46, height: 46 },
  neutral: null,
});
// The build accessory in region coordinates: a hammer swinging around the end of its handle between
// the two angles (degrees, clockwise positive), and three bricks; strokes are at most 1.5 px wide.
export const HAMMER = Object.freeze({ pivot: Object.freeze({ x: 36, y: 44 }), swing: Object.freeze([-55, 5]),
  head: Object.freeze({ x: -6, y: -26, width: 12, height: 6 }), handle: Object.freeze({ x: -1.5, y: -20, width: 3, height: 20 }) });
export const BRICKS = Object.freeze([{ x: 2, y: 38 }, { x: 17, y: 38 }, { x: 9.5, y: 30 }].map(Object.freeze));
export const BRICK_SIZE = Object.freeze({ width: 14, height: 7 });

const BODY = Object.freeze({
  laeuft: { fill: '#4F7FD9', stroke: '#2D4E8F' },
  baut: { fill: '#3E8FB0', stroke: '#235A70' },
  wartet: { fill: '#E0A030', stroke: '#9A6A12' },
  blockiert: { fill: '#D9534F', stroke: '#8F2D2A' },
  fertig: { fill: '#3FA66A', stroke: '#23663F' },
  neutral: { fill: '#9AA3B2', stroke: '#5C6575' },
});
const INK = '#1F2430';

const escape = text => String(text).replace(/[&<>"]/gu, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);
const loop = (isMoving, animation) => (isMoving ? animation : '');

function eyes(mood, isMoving) {
  if (mood === 'blockiert') {
    const cross = x => `<path d="M${x - 6} 66 l12 12 M${x + 6} 66 l-12 12" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
    return cross(64) + cross(96);
  }
  if (mood === 'fertig') {
    const arc = x => `<path d="M${x - 7} 74 q7 -9 14 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
    return arc(64) + arc(96);
  }
  const blink = loop(isMoving, '<animate attributeName="ry" values="9;9;1;9" keyTimes="0;0.9;0.95;1" dur="3.6s" repeatCount="indefinite"/>');
  const look = mood === 'laeuft'
    ? loop(isMoving, '<animateTransform attributeName="transform" type="translate" values="-3 0;3 0;-3 0" dur="1.6s" repeatCount="indefinite"/>')
    : '';
  // A figure that builds looks down at its work on the right.
  const [dx, dy] = mood === 'baut' ? [3, 2] : [0, 0];
  const eye = x => `<ellipse cx="${x}" cy="72" rx="9" ry="9" fill="#FFFFFF">${blink}</ellipse><g>${look}<circle cx="${x + dx}" cy="${73 + dy}" r="4" fill="${INK}"/></g>`;
  return eye(64) + eye(96);
}

const MOUTH = Object.freeze({
  laeuft: `<ellipse cx="80" cy="96" rx="4" ry="5" fill="${INK}"/>`,
  baut: `<path d="M74 97 q6 4 12 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  wartet: `<path d="M72 97 h16" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  blockiert: `<path d="M70 101 q10 -9 20 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  fertig: `<path d="M68 93 q12 12 24 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  neutral: `<path d="M73 97 h14" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
});

const MOTION = Object.freeze({
  laeuft: '<animateTransform attributeName="transform" type="translate" values="0 0;0 -7;0 0" dur="0.7s" repeatCount="indefinite"/>',
  // A slow bob in time with the hammer.
  baut: '<animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" keyTimes="0;0.35;1" dur="0.9s" repeatCount="indefinite"/>',
  wartet: '<animateTransform attributeName="transform" type="rotate" values="-4 80 124;4 80 124;-4 80 124" dur="2.6s" repeatCount="indefinite"/>',
  blockiert: '<animateTransform attributeName="transform" type="translate" values="0 0;-4 0;4 0;-4 0;4 0;0 0;0 0" keyTimes="0;0.04;0.08;0.12;0.16;0.2;1" dur="2.2s" repeatCount="indefinite"/>',
  fertig: '<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -10;0 0" keyTimes="0;0.6;0.8;1" dur="2s" repeatCount="indefinite"/>',
  neutral: '',
});

// Drawn in region coordinates (0..48); ACCESSORY_BOUNDS states each extent.
function accessory(mood, isMoving) {
  if (mood === 'laeuft') {
    const dot = (x, begin) => `<circle cx="${x}" cy="24" r="4" fill="#4F7FD9">${loop(isMoving, `<animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" begin="${begin}" repeatCount="indefinite"/>`)}</circle>`;
    return dot(12, '0s') + dot(24, '0.2s') + dot(36, '0.4s');
  }
  if (mood === 'baut') {
    // One brick appears per hammer stroke; the still pose shows all three and the raised hammer.
    const brick = ({ x, y }, begin) => `<rect x="${x}" y="${y}" width="${BRICK_SIZE.width}" height="${BRICK_SIZE.height}" rx="1" fill="#C8643C" stroke="#7A3A1E" stroke-width="1.5" opacity="${isMoving ? 0 : 1}">`
      + `${loop(isMoving, `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.7s" begin="${begin}" repeatCount="indefinite"/>`)}</rect>`;
    const { pivot: { x: px, y: py }, swing: [strike, raised], head, handle } = HAMMER;
    const swing = loop(isMoving, `<animateTransform attributeName="transform" type="rotate" values="${raised} ${px} ${py};${strike} ${px} ${py};${raised} ${px} ${py}" keyTimes="0;0.35;1" dur="0.9s" repeatCount="indefinite"/>`);
    return BRICKS.map((position, index) => brick(position, `${index * 0.9}s`)).join('')
      + `<g transform="rotate(${raised} ${px} ${py})">${swing}`
      + `<rect x="${px + handle.x}" y="${py + handle.y}" width="${handle.width}" height="${handle.height}" rx="1" fill="#A0703C" stroke="#5C3A1A" stroke-width="1"/>`
      + `<rect x="${px + head.x}" y="${py + head.y}" width="${head.width}" height="${head.height}" rx="1" fill="#8A93A3" stroke="#374151" stroke-width="1.5"/></g>`;
  }
  if (mood === 'wartet') {
    const turn = loop(isMoving, '<animateTransform attributeName="transform" type="rotate" values="0 24 24;0 24 24;180 24 24" keyTimes="0;0.7;1" dur="2.4s" repeatCount="indefinite"/>');
    return `<g>${turn}<path d="M16 12 h16 l-8 12 l8 12 h-16 l8 -12 z" fill="#FFF3D6" stroke="#9A6A12" stroke-width="2.5" stroke-linejoin="round"/></g>`;
  }
  if (mood === 'blockiert') {
    return '<g transform="translate(24 24)"><polygon points="-7,-17 7,-17 17,-7 17,7 7,17 -7,17 -17,7 -17,-7" fill="#D9534F" stroke="#8F2D2A" stroke-width="2"/>'
      + '<rect x="-2" y="-10" width="4" height="12" rx="1.5" fill="#FFFFFF"/><circle cx="0" cy="7" r="2.4" fill="#FFFFFF"/></g>';
  }
  if (mood === 'fertig') {
    const sparkle = (x, y, begin) => `<path d="M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z" fill="#F2C94C">`
      + `${loop(isMoving, `<animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="${begin}" repeatCount="indefinite"/>`)}</path>`;
    return sparkle(8, 8, '0s') + sparkle(40, 8, '0.6s') + sparkle(40, 40, '1.2s')
      + '<g transform="translate(22 28)"><circle r="12" fill="#FFFFFF" stroke="#23663F" stroke-width="2.5"/>'
      + '<path d="M-6 0 l4 5 l8 -10" fill="none" stroke="#23663F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>';
  }
  return '';
}

// mood: one of the five moods or 'neutral' (no run assigned, status unreadable).
export function figureSvg(mood, { still = false, title = '' } = {}) {
  const isMoving = !still;
  const { fill, stroke } = BODY[mood];
  const { x, y } = ACCESSORY_REGION;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW.width} ${VIEW.height}" width="${VIEW.width}" height="${VIEW.height}">`
    + `<title>${escape(title)}</title>`
    + '<ellipse cx="80" cy="128" rx="40" ry="6" fill="#000000" opacity="0.12"/>'
    + `<g>${loop(isMoving, MOTION[mood])}`
    + `<ellipse cx="62" cy="122" rx="11" ry="6" fill="${stroke}"/><ellipse cx="98" cy="122" rx="11" ry="6" fill="${stroke}"/>`
    + `<path d="M34 84 q0 -46 46 -46 q46 0 46 46 q0 36 -46 36 q-46 0 -46 -36 z" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`
    + `<path d="M52 40 l-8 -14 l18 8 z M108 40 l8 -14 l-18 8 z" fill="${fill}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>`
    + '<ellipse cx="80" cy="100" rx="26" ry="17" fill="#FFFFFF" opacity="0.28"/>'
    + eyes(mood, isMoving) + MOUTH[mood] + '</g>'
    + `<g transform="translate(${x} ${y})">${accessory(mood, isMoving)}</g>`
    + '</svg>';
}

// The terminal has no Svg: a short face stands for the figure there.
export const FIGURE_TEXT = Object.freeze({
  laeuft: '(o_o) …',
  baut: '(o_o) ⚒',
  wartet: '(-_-) ⧗',
  blockiert: '(x_x) !',
  fertig: '(^_^) ✓',
  neutral: '(·_·)',
});
