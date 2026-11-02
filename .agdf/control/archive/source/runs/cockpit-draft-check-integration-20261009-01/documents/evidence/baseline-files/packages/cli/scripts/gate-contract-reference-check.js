import assert from "node:assert/strict";

export function checkFocusedGateContracts(gateCheckSkill) {
  const focusedContracts = [
    "task-target-resolution.md",
    "gate-transition.md",
    "gate-artifact-preparation.md",
    "interaction.md",
    "control-scaffold.md",
    "modes.md",
    "quality.md",
  ];
  function assertFocusedContracts(content) {
    for (const focusedContract of focusedContracts) {
      const reference = `\`../../meta/contracts/${focusedContract}\``;
      assert.equal(content.split(reference).length - 1, 1, `${reference} must be declared exactly once`);
    }
  }
  assertFocusedContracts(gateCheckSkill);
  for (const focusedContract of focusedContracts) {
    const reference = `\`../../meta/contracts/${focusedContract}\``;
    assert.throws(() => assertFocusedContracts(`${gateCheckSkill}\n- ${reference}\n`), /must be declared exactly once/);
    assert.throws(() => assertFocusedContracts(gateCheckSkill.replace(reference, "")), /must be declared exactly once/);
    assert.throws(
      () => assertFocusedContracts(gateCheckSkill.replace(reference, `\`../other/${focusedContract}\``)),
      /must be declared exactly once/,
    );
  }
}
