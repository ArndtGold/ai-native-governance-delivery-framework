import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pagesRoot = fileURLToPath(new URL("..", import.meta.url));
const homepagePath = resolve(pagesRoot, "dist", "index.html");
const sourcePath = resolve(pagesRoot, "src", "pages", "index.astro");
const layoutPath = resolve(pagesRoot, "src", "layouts", "BaseLayout.astro");
const stylePath = resolve(pagesRoot, "src", "styles", "global.css");

assert.equal(existsSync(homepagePath), true, "built homepage must exist");

const html = readFileSync(homepagePath, "utf8");
const source = readFileSync(sourcePath, "utf8");
const layout = readFileSync(layoutPath, "utf8");
const styles = readFileSync(stylePath, "utf8");
const expectedSectionIds = ["home", "problem", "how-it-works", "outcomes", "proof", "setup", "responsibility"];
const exactHero = {
  audience: "For engineering teams using coding agents on real repositories",
  title: "Agent speed needs a control system.",
  lead: "AGDF is the control layer for governed AI-assisted delivery.",
  formula: "In Formula 1, the engine creates speed. Rules, evidence, strategy and human decisions determine what happens next. AI-assisted delivery has the same challenge: agent output is fast, but teams still need approved scope, visible evidence and controlled transitions.",
};

const normalize = (value) => value.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const visibleText = (value) => normalize(value
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
  .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
  .replace(/<[^>]+>/g, " "));
const countWords = (value) => [...new Intl.Segmenter("en", { granularity: "word" }).segment(value)].filter((part) => part.isWordLike).length;
const occurrences = (haystack, needle) => haystack.split(needle).length - 1;

function sectionEntries(document) {
  return [...document.matchAll(/<section\b([^>]*\bdata-home-section\b[^>]*)>([\s\S]*?)<\/section>/gi)].map((match) => ({
    attrs: match[1],
    body: match[2],
    id: match[1].match(/\bid="([^"]+)"/i)?.[1],
  }));
}

function mutateHomeSection(documentSections, from, to) {
  return documentSections.map((section) => section.id === "home" ? { ...section, body: section.body.replace(from, to) } : section);
}

function validateCore(document) {
  const sections = sectionEntries(document);
  assert.deepEqual(sections.map((section) => section.id), expectedSectionIds, "homepage must expose exactly seven approved sections in order");
  assert.equal((document.match(/<section\b/gi) ?? []).length, 7, "homepage sections must not be nested or duplicated");
  assert.equal((document.match(/<h1\b/gi) ?? []).length, 1, "homepage must contain exactly one h1");
  assert.equal((document.match(/<h2\b/gi) ?? []).length, 6, "every post-Hero section must contain one h2");
  assert.equal((document.match(/<script\b/gi) ?? []).length, 0, "homepage must contain no client script");
  return sections;
}

function validateWordLimit(text) {
  const words = countWords(text);
  assert.ok(words <= 2200, `homepage word count ${words} exceeds hard maximum 2200`);
  return words;
}

function validateHero(documentSections) {
  const documentById = Object.fromEntries(documentSections.map((section) => [section.id, section]));
  const documentText = visibleText(documentSections.map((section) => section.body).join(" "));
  const documentHeroText = visibleText(documentById.home.body);
  for (const [label, copy] of Object.entries(exactHero)) assert.equal(documentHeroText.includes(copy), true, `Hero must preserve exact ${label} copy`);
  assert.match(documentById.home.body, /Agent:<\/strong>\s*&nbsp;speed/);
  assert.match(documentById.home.body, /AGDF:<\/strong>\s*&nbsp;delivery control/);
  assert.match(documentById.home.body, /People:<\/strong>\s*&nbsp;decisions/);
  assert.match(documentById.home.body, /href="#setup"[^>]*>Install AGDF<\/a>/);
  assert.match(documentById.home.body, /href="https:\/\/github\.com\/arndtgold\/ai-native-governance-delivery-framework"[^>]*>View on GitHub<\/a>/);
  assert.equal(occurrences(documentText, "Formula 1"), 1, "Formula 1 analogy must occur exactly once");
  for (const forbidden of ["telemetry", "operating system", "runtime", "orchestration", "race control"]) {
    assert.equal(documentHeroText.toLowerCase().includes(forbidden), false, `Hero analogy must not imply ${forbidden}`);
  }
  return { documentById, documentText, documentHeroText };
}

function validateControlLoop(loopSection) {
  const orderedLoop = ["Approved scope", "Evidence", "Gate", "Transition"];
  const loopIndexes = orderedLoop.map((label) => loopSection.body.indexOf(`>${label}</h3>`));
  assert.equal(loopIndexes.every((index) => index >= 0), true, "control loop must render all four steps as h3 headings");
  assert.equal(loopIndexes.every((index, position) => position === 0 || index > loopIndexes[position - 1]), true, "control loop steps must preserve approved order");
}

const protectedPhrases = [
  "Skills-only public candidate",
  "without adding an AGDF-operated MCP server",
  "Advisory until verified",
  "Installation alone does not prove enforcement",
  "OpenAI owns verified publisher identity",
  "not an OpenAI product",
  "plugin-scoped resource checks",
  "Individual standalone skills",
  "identical cross-host behavior",
];

function validateProtectedCopy(text) {
  for (const phrase of protectedPhrases) assert.equal(text.includes(phrase), true, `homepage must preserve public-plugin boundary: ${phrase}`);
}

function validateFragments(document) {
  const fragmentIds = new Set([...document.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  for (const match of document.matchAll(/href="#([^"]+)"/g)) assert.equal(fragmentIds.has(match[1]), true, `local fragment #${match[1]} must resolve`);
}

function validateMetadata(document) {
  assert.match(document, /<title>AGDF — Agent speed needs a control system\.<\/title>/);
  assert.match(document, /<meta name="description" content="For engineering teams using coding agents on real repositories: AGDF keeps scope approved, evidence visible and delivery decisions under human control\.">/);
  assert.match(document, /<link rel="canonical" href="https:\/\/agdf\.iself\.eu\/">/);
  for (const field of ["og:title", "og:description", "og:url", "og:image", "twitter:title", "twitter:description", "twitter:image"]) {
    assert.equal(document.includes(field), true, `metadata must include ${field}`);
  }
  const socialImageUrl = document.match(/<meta property="og:image" content="([^"]+)">/)?.[1];
  assert.ok(socialImageUrl, "Open Graph image URL must be present");
  const socialImagePath = new URL(socialImageUrl).pathname;
  assert.equal(existsSync(resolve(pagesRoot, "public", socialImagePath.slice(1))), true, "Open Graph image must resolve to a shipped asset");
}

function validateImageBudget(paths, sizeOf = (path) => {
  const assetPath = resolve(pagesRoot, "public", path.slice(1));
  assert.equal(existsSync(assetPath), true, `referenced local image must exist: ${path}`);
  return statSync(assetPath).size;
}) {
  const bytes = paths.reduce((total, path) => total + sizeOf(path), 0);
  assert.ok(bytes <= 8_570_997, "referenced local image bytes must not exceed baseline");
  return bytes;
}

const sections = validateCore(html);
const { documentById: byId, documentText: homepageText, documentHeroText: heroText } = validateHero(sections);
const wordCount = validateWordLimit(homepageText);
console.log(`Landing-page visible word count: ${wordCount} (editorial target 1500–1800; hard maximum 2200)`);
assert.equal(visibleText(byId.problem.body).includes(problemComparisonTitle("without")), true);
assert.equal(heroText.includes(problemComparisonTitle("without")), false, "before/after comparison must live outside Hero");
assert.equal(visibleText(byId.problem.body).includes("Agent activity is not delivery progress."), true, "Problem must state the activity-to-delivery distinction");
const problemText = visibleText(byId.problem.body);
for (const positioningClaim of [
  "Many frameworks help agents do the work.",
  "AGDF controls whether that work may count as governed delivery progress.",
  "Governed transitions depend on approved scope, explicit human authority and evidence that supports the claim.",
  "Durable repository-owned control state keeps approvals, evidence and the next allowed action understandable across chats, agents and hosts.",
]) {
  assert.equal(problemText.includes(positioningClaim), true, `Problem must preserve defensible positioning: ${positioningClaim}`);
}
for (const unsupportedComparison of ["superior", "better than", "the only framework"]) {
  assert.equal(problemText.toLowerCase().includes(unsupportedComparison), false, `Problem must not claim ${unsupportedComparison}`);
}
for (const competitor of ["OpenSpec", "Spec Kit", "BMAD", "Superpowers", "Compound Engineering", "Ruflo", "Aperant"]) {
  assert.equal(homepageText.includes(competitor), false, `homepage must not name competitor: ${competitor}`);
}
assert.equal(homepageText.includes("Fast output is not the same as governed delivery."), false, "superseded Problem thesis must not remain");

validateControlLoop(byId["how-it-works"]);
for (const outcome of ["Controlled scope", "Evidence-backed decisions", "Auditable closeout"]) {
  assert.match(byId.outcomes.body, new RegExp(`>${outcome}<\\/h3>`));
}

validateProtectedCopy(homepageText);
for (const awkwardPhrase of ["active context", "expected-release source", "it does not impersonate either", "merely because", "recorded at the level they actually prove"]) {
  assert.equal(homepageText.toLowerCase().includes(awkwardPhrase), false, `first-reader copy must avoid unclear phrase: ${awkwardPhrase}`);
}

assert.equal(homepageText.includes("Install for your coding agent"), true);
assert.equal(homepageText.includes("npx --yes @agdf/cli@latest codex"), true);
assert.equal(homepageText.includes("npx --yes @agdf/cli@latest copilot"), true);
assert.equal(homepageText.includes("Installable AGDF plugin"), true);
assert.match(byId.setup.body, /https:\/\/github\.com\/arndtgold\/ai-native-governance-delivery-framework\/blob\/main\/INSTALL\.md/);
for (const href of ["/privacy", "/terms", "/support"]) assert.equal(html.includes(`href="${href}"`), true, `homepage must link ${href}`);
assert.match(html, /https:\/\/github\.com\/arndtgold\/ai-native-governance-delivery-framework\/tree\/main\/docs\/handbook/);

validateFragments(html);
validateMetadata(html);

for (const token of ["data-reveal", "data-skill", "skill-modal", "lightbox", "scroll-progress", "nav-spy", "nav-menu-panel"]) {
  assert.equal(`${source}\n${layout}\n${styles}`.includes(token), false, `obsolete homepage owner must be removed: ${token}`);
}
const htmlTagsWithoutClasses = [...html.matchAll(/<[^>]+>/g)].map((match) => match[0].replace(/\sclass="[^"]*"/gi, ""));
assert.equal(htmlTagsWithoutClasses.some((tag) => /(?:^|\s)hidden(?:\s|=|>)/i.test(tag)), false, "homepage must not use the hidden attribute for script-dependent initial state");

const localImages = [...new Set([...html.matchAll(/<img\b[^>]*\bsrc="(\/[^"?#]+)"/gi)].map((match) => match[1]))];
const imageBytes = validateImageBudget(localImages);
console.log(`Landing-page local image payload: ${imageBytes} bytes across ${localImages.length} unique assets`);
assert.ok(imageBytes <= 8_570_997, "referenced local image bytes must not exceed baseline");
for (const removed of ["race-control-track-visual.jpg", "author.png", "claude-agdf-plugin-ui.png", "opencode-agdf-plugin-proof.png", "codex-gate-check-proof.png", "codex-uat-ready-proof.png"]) {
  assert.equal(localImages.some((path) => path.endsWith(removed)), false, `homepage must not reference retired asset ${removed}`);
}
assert.ok(localImages.filter((path) => /(?:proof|plugin-ui)\.(?:png|jpe?g|webp)$/i.test(path)).length <= 1, "homepage may reference at most one proof screenshot");

// Mutation probes prove that the critical validators fail closed.
assert.throws(() => validateCore(html.replace('id="responsibility" data-home-section', 'id="responsibility"')), /seven approved sections/);
assert.throws(() => validateCore(html.replace("</main>", '<section id="extra" data-home-section></section></main>')), /seven approved sections|nested or duplicated/);
assert.throws(() => validateCore(html.replace('id="home"', 'id="temporary"').replace('id="problem"', 'id="home"').replace('id="temporary"', 'id="problem"')), /seven approved sections/);
assert.throws(() => validateCore(html.replace("</body>", "<script>void 0</script></body>")), /no client script/);
assert.throws(() => validateWordLimit("word ".repeat(2201)), /exceeds hard maximum/);
assert.throws(() => validateControlLoop({ body: byId["how-it-works"].body.replace(">Gate</h3>", ">Missing</h3>") }), /all four steps/);
assert.throws(() => validateProtectedCopy(homepageText.replace(protectedPhrases[0], "removed phrase")), /public-plugin boundary/);
assert.throws(() => validateFragments(html.replace('href="#setup"', 'href="#missing-destination"')), /must resolve/);
assert.throws(() => validateMetadata(html.replace('<link rel="canonical" href="https://agdf.iself.eu/">', "")), /canonical/);
assert.throws(() => validateMetadata(html.replace('property="og:title"', 'property="malformed-title"')), /og:title/);
assert.throws(() => validateHero(mutateHomeSection(sections, exactHero.title, "Altered Hero")), /exact title copy/);
assert.throws(() => validateHero(mutateHomeSection(sections, "People:<\/strong>", "Owners:</strong>")), /People/);
assert.throws(() => validateHero(mutateHomeSection(sections, "controlled transitions.", "controlled transitions. Formula 1")), /exactly once/);
assert.throws(() => validateHero(mutateHomeSection(sections, exactHero.formula, `${exactHero.formula} AGDF runtime.`)), /must not imply runtime/);
assert.throws(() => validateImageBudget(["/synthetic-regression.png"], () => 8_570_998), /must not exceed baseline/);

console.log("Landing-page structure, copy, boundary, metadata, No-JS and payload tests passed");

function problemComparisonTitle(kind) {
  return kind === "without" ? "Coding agent without AGDF" : "Coding agent governed by AGDF";
}
