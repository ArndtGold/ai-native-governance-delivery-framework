// Static form of the Claude host's module rule for the companion (T-013 finding F1, TP T-014, SCN-023): the
// host loads a hooks module only when `$` is used as `$.noun.member(...)` at the call site, with documented
// property reads such as `$.plugin.root`, or is passed whole to a local function. The modules are parsed
// with acorn, so comments, strings and regex literals can neither hide nor fake a use. `claude plugin
// validate` stays the authoritative check where the Claude CLI is installed.
import { parse } from "acorn";

// `$.noun.member` reads the host documents as values; everything else must be called.
export const HOST_PROPERTY_READS = Object.freeze(["plugin.root"]);

const parseModule = source => parse(source, { ecmaVersion: "latest", sourceType: "module" });
const isNode = value => Boolean(value) && typeof value.type === "string";
const children = node => Object.entries(node)
  .filter(([key]) => !["type", "start", "end"].includes(key))
  .flatMap(([, value]) => (Array.isArray(value) ? value : [value]))
  .filter(isNode);

function walk(node, ancestors, visit) {
  visit(node, ancestors);
  for (const child of children(node)) walk(child, [node, ...ancestors], visit);
}

const isParameter = (node, parent) => Boolean(parent) && /Function/u.test(parent.type) && parent.params.includes(node);
const plainMember = (node, object) => node?.type === "MemberExpression" && node.object === object && !node.computed && !node.optional;

// Every use of `$` the host refuses, as written in the source (empty when the module is loadable).
export function hostSpellingViolations(source) {
  const violations = [];
  walk(parseModule(source), [], (node, [parent, grand, great]) => {
    if (node.type !== "Identifier" || node.name !== "$" || isParameter(node, parent)) return;
    if (parent?.type === "CallExpression" && parent.arguments.includes(node)) return; // passed whole
    const member = plainMember(parent, node) && plainMember(grand, parent);
    if (member && great?.type === "CallExpression" && great.callee === grand && !great.optional) return; // called
    if (member && HOST_PROPERTY_READS.includes(`${parent.property.name}.${grand.property.name}`)) return; // documented read
    const shown = member ? grand : plainMember(parent, node) || parent?.type === "MemberExpression" ? parent : node;
    violations.push(source.slice(shown.start, shown.end));
  });
  return violations;
}

// Every call of a member named `run` or `spawn`, with its callee as written (whitespace removed), e.g.
// `$.process.run` or `processes.run`; the companion may start no process but the run view (SDD-010).
export function processCalls(source) {
  const calls = [];
  walk(parseModule(source), [], node => {
    if (node.type === "CallExpression" && node.callee.type === "MemberExpression" && !node.callee.computed
      && ["run", "spawn"].includes(node.callee.property.name)) calls.push(source.slice(node.callee.start, node.callee.end).replace(/\s+/gu, ""));
  });
  return calls;
}
