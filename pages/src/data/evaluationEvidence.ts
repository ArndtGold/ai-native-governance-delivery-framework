import pluginDefinition from "../../../plugin/meta/agdf-plugin.definition.json";

type EvaluationCase = {
  case_id: string;
  target_skill: string;
  case_class: string;
};

const caseModules = import.meta.glob("../../../evals/cases/*.json", {
  eager: true,
  import: "default",
}) as Record<string, EvaluationCase[]>;

const cases = Object.values(caseModules).flat();
const canonicalSkills = pluginDefinition.skillSet.map((skill) => skill.slug);
const requiredCaseClasses = ["normal", "boundary", "adversarial"] as const;
const caseIds = new Set(cases.map((testCase) => testCase.case_id));

if (caseIds.size !== cases.length) {
  throw new Error("Pages evaluation evidence requires unique behavioral case IDs.");
}

for (const testCase of cases) {
  if (!canonicalSkills.includes(testCase.target_skill)) {
    throw new Error(`Pages evaluation evidence found an unknown skill: ${testCase.target_skill}.`);
  }
}

for (const skill of canonicalSkills) {
  for (const caseClass of requiredCaseClasses) {
    if (!cases.some((testCase) => testCase.target_skill === skill && testCase.case_class === caseClass)) {
      throw new Error(`Pages evaluation evidence is missing ${skill}:${caseClass}.`);
    }
  }
}

export const evaluationEvidence = Object.freeze({
  canonicalSkills: canonicalSkills.length,
  behavioralCases: cases.length,
  caseClasses: requiredCaseClasses,
});
