// A bounded report grammar, not a general Markdown parser. Only initial metadata
// and the first scalar block of an explicit H2 decision section author a result.
const metadata = new Set(['decision', 'status', 'gate', 'gate approval', 'based on',
  'date', 'owner', 'type', 'mode', 'reviewer', 'reviewed_at', 'run_id', 'source_revision',
  'traceability contract']);
const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr']);
const rawTags = new Set(['script', 'style', 'textarea']);
const tagStart = /<\/?([a-z][a-z0-9:-]*)(?=[\s/>])/iyu;

function specialHtmlEnd(text, at) {
  const special = text.startsWith('<!--', at) ? [4, '-->']
    : text.startsWith('<![CDATA[', at) ? [9, ']]>']
      : text.startsWith('<?', at) ? [2, '?>'] : null;
  if (!special) return null;
  const end = text.indexOf(special[1], at + special[0]);
  return end < 0 ? text.length : end + special[1].length;
}

// Consume markup with quote-aware tags and nesting. Uncertain termination keeps
// the remainder excluded; apparent tags in attributes/comments never close it.
function htmlEnd(text, start) {
  const stack = [];
  let cursor = start;
  do {
    const raw = stack.at(-1);
    if (rawTags.has(raw)) {
      const close = new RegExp(`</${raw}[\\t \\n]*>`, 'igu');
      close.lastIndex = cursor;
      const match = close.exec(text);
      if (!match) return text.length;
      cursor = close.lastIndex; stack.pop();
      continue;
    }
    const at = text.indexOf('<', cursor);
    if (at < 0) return text.length;
    const special = specialHtmlEnd(text, at);
    if (special !== null) { cursor = special; continue; }
    tagStart.lastIndex = at;
    const tag = tagStart.exec(text);
    const declaration = text.startsWith('<!', at);
    if (!tag && !declaration) return text.length;
    let end = tag ? tagStart.lastIndex : at + 2, quote = null, brackets = 0;
    for (; end < text.length; end++) {
      const char = text[end];
      if (quote) { if (char === quote) quote = null; }
      else if (char === '"' || char === "'") quote = char;
      else if (char === '<' && declaration && brackets) {
        const nested = specialHtmlEnd(text, end);
        if (nested !== null) end = nested - 1;
      }
      else if (declaration && char === '[') brackets++;
      else if (declaration && char === ']') { if (!brackets) return text.length; brackets--; }
      else if (char === '>' && !brackets) break;
      else if (char === '<' && (!declaration || !brackets)) return text.length;
    }
    if (end === text.length || quote) return text.length;
    cursor = end + 1;
    if (declaration) continue;
    const name = tag[1].toLowerCase(), closing = text[at + 1] === '/';
    if (closing) {
      if (!/^[\t \n]*$/u.test(text.slice(tagStart.lastIndex, end)) || stack.at(-1) !== name) return text.length;
      stack.pop();
    // In HTML, '/>' does not close a non-void element (including raw blocks).
    } else if (!voidTags.has(name)) stack.push(name);
  } while (stack.length);
  return cursor;
}

// Ignore escaped and inline-code '<' characters. An unmatched inline-code opener
// conservatively masks the rest of this line; it cannot author a scalar field.
function markupIndex(line, start = 0, limit = line.length) {
  let ticks = 0;
  for (let i = start; i < limit; i++) {
    if (line[i] === '\\') { i++; continue; }
    if (line[i] === '`') {
      let end = i + 1;
      while (end < limit && line[end] === '`') end++;
      const count = end - i;
      if (!ticks) ticks = count;
      else if (ticks === count) ticks = 0;
      i = end - 1;
    } else if (!ticks && line[i] === '<') return i;
  }
  return -1;
}

// One lexical owner for the result observer and closed decision-content profiles.
// Boundary events also exclude lazy continuations: a closed block cannot reopen
// on a blank or an apparent field; only an actual admitted heading reopens it.
function* reportLines(text) {
  let fence = null, skipUntil = 0;
  let offset = 0;
  for (const line of text.split('\n')) {
    const start = offset; offset += line.length + 1;
    if (start < skipUntil) continue;
    const unfenced = line.replace(/^(?:[ \t]*>[ \t]?)+/u, '')
      .replace(/^[ \t]*(?:[-+*]|\d+[.)])[ \t]+/u, '');
    const markers = unfenced.match(/^ {0,3}(`{3,}|~{3,})([^\n]*)$/u);
    if (fence) {
      if (markers && markers[1][0] === fence.kind && markers[1].length >= fence.length && !markers[2].trim()) fence = null;
      continue;
    }
    if (markers) {
      fence = { kind: markers[1][0], length: markers[1].length };
      yield { boundary: true }; continue;
    }
    const heading = line.match(/^(#{1,6})[\t ]+([^\n]+)$/u);
    let name;
    if (heading) {
      name = heading[2].trim(); let end = name.length;
      while (end && name[end - 1] === '#') end--;
      if (end < name.length && end && /[\t ]/u.test(name[end - 1])) name = name.slice(0, end).trimEnd();
    }
    let html = markupIndex(line);
    yield { line, level: heading?.[1].length, name, markup: html >= 0 };
    if (html >= 0) {
      // Also consume sibling markup on the final line, not just the first tag.
      let end = start + html, lineEnd = start + line.length;
      do {
        end = htmlEnd(text, end);
        if (end > lineEnd) {
          const newline = text.indexOf('\n', end);
          lineEnd = newline < 0 ? text.length : newline;
        }
        html = markupIndex(text, end, lineEnd);
        if (html < 0) { skipUntil = lineEnd + 1; break; }
        end = html;
      } while (end < text.length);
      if (end >= text.length) skipUntil = text.length;
    }
  }
}

function* authoredFields(text) {
  let active = true, titleAllowed = true;
  for (const row of reportLines(text)) {
    if (row.boundary) { active = false; titleAllowed = false; continue; }
    if (!row.line.trim()) continue;
    if (row.level) {
      if (!(titleAllowed && row.level === 1)) active = row.level === 2 && /^(?:\d+\.[\t ]+)?(?:QA[\t ]+)?Decision$/iu.test(row.name);
      titleAllowed = false;
    } else {
      const scalar = active && row.line.match(/^(?:- )?([a-z][a-z_ -]*):[\t ]*([^\n]*)$/iu);
      if (scalar && metadata.has(scalar[1].toLowerCase())) {
        titleAllowed = false;
        if (/^(?:decision|status)$/iu.test(scalar[1])) yield [scalar[1], scalar[2]];
      } else { active = false; titleAllowed = false; }
    }
    if (row.markup) { active = false; titleAllowed = false; }
  }
}

const summaryFields = new Set(['problem', 'ziel', 'goal', 'betroffene', 'users', 'umfang', 'scope', 'abnahme', 'acceptance', 'offen', 'open questions',
  'qa-ergebnis', 'qa result', 'umsetzung', 'implementation', 'nachweise', 'evidence', 'ergebnis', 'delivered result', 'grenzen', 'qualification limits',
  'risiken', 'risks', 'nächster schritt', 'next step', 'quellen und abgrenzung', 'risiken und klärung',
  'entscheidung', 'decision', 'tp-abdeckung', 'task plan coverage', 'lücken', 'missing evidence']);
const contentProfiles = Object.freeze({
  objective: { heading: /^Objective$/iu, paragraph: true },
  goal: { heading: /^(?:\d+\.[\t ]+)?Goal$/iu, paragraph: true },
  result: { heading: /^(?:\d+\.[\t ]+)?TP Coverage$/iu, fields: ['delivered_result'] },
  limits: { heading: /^(?:\d+\.[\t ]+)?Missing Evidence$/iu, fields: ['qualification_limits'] },
  risks: { heading: /^(?:\d+\.[\t ]+)?Risks$/iu, fields: ['delivery_risks'] },
});

// Closed internal profiles only; no caller-selected heading/regex or Markdown API.
export function readAuthoredContent(text, profile, { locale, sourceLanguage } = {}) {
  if (typeof text !== 'string' || Buffer.byteLength(text) > 131072) return null;
  if (profile === 'title') {
    for (const row of reportLines(text.replace(/\r\n?/gu, '\n'))) if (row.level === 1 && !row.markup) return row.name;
    return null;
  }
  const localized = profile === 'localized';
  // Fields are keyed by the display locale; the source may be any well-formed language tag.
  const spec = localized && ['en', 'de'].includes(locale) && /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/u.test(sourceLanguage ?? '')
    ? { heading: new RegExp('^AGDF Approval Summary \\(' + locale + ';[\\t ]*source=' + sourceLanguage + '\\)$', 'iu'), fields: null }
    : contentProfiles[profile];
  if (!spec) return null;
  let active = false, sections = 0, started = false;
  const lines = [], fields = {};
  for (const row of reportLines(text.replace(/\r\n?/gu, '\n'))) {
    if (row.boundary || row.markup) { active = false; continue; }
    if (row.level) {
      active = row.level === 2 && spec.heading.test(row.name); started = false;
      if (active && ++sections !== 1) return null;
      continue;
    }
    if (!active) continue;
    if (!row.line.trim()) { if (spec.paragraph && started) active = false; continue; }
    if (spec.paragraph) {
      if (/^(?:\s|[-+*>]|\d+[.)][\t ])/u.test(row.line)) { active = false; continue; }
      started = true; lines.push(row.line.trim());
    } else {
      // A localized summary may carry labels outside the closed field set, including a
      // qualified label such as `Problem (Messlücke):`. Such a labelled line is skipped,
      // so field order never decides readability; any other line still closes the block.
      const scalar = row.line.match(localized
        ? /^(?:- )?([\p{L}][\p{L}\p{N}_ -]*?)([\t ]*\([^()\n]*\))?:[\t ]*([^\n]*)$/u
        : /^(?:- )?([\p{L}][\p{L}\p{N}_ -]*)():[\t ]*([^\n]*)$/u);
      const key = scalar && (localized ? scalar[1].trimEnd() : scalar[1]).toLowerCase();
      const known = key && !scalar[2] && (localized ? summaryFields.has(key) || /^ac-[a-z0-9-]+$/iu.test(key) : spec.fields.includes(key));
      if (localized && key && !known) continue;
      if (!known) { active = false; continue; }
      if (Object.hasOwn(fields, key)) return null;
      fields[key] = scalar[3].trim(); started = true;
    }
  }
  return sections === 1 && (spec.paragraph ? lines.length : Object.keys(fields).length) ? spec.paragraph ? lines.join(' ') : fields : null;
}

// Observe an authored technical result, never decide or approve QA. The closed
// internal opt-in preserves analysis not_applicable; QA's domain stays unchanged.
export function readReportDecision(text, { allowNotApplicable = false } = {}) {
  if (typeof text !== 'string') return null;
  const results = new Set();
  for (const [field, raw] of authoredFields(text.replace(/\r\n?/gu, '\n'))) {
    const value = raw.trim().replace(/^`([^`]+)`$/u, '$1').toLowerCase();
    const result = value === 'passed' ? 'pass' : value;
    if (['pass', 'revise', 'block'].includes(result) || allowNotApplicable === true && result === 'not_applicable') results.add(result);
    else if (field.toLowerCase() === 'decision') return null;
  }
  return results.size === 1 ? [...results][0] : null;
}
