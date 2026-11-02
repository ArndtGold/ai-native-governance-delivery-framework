export function createReadinessReport({ definition, fileCount, inventoryDigest }) {
  const contract = definition.publicDistribution;
  return {
    schemaVersion: 1,
    releaseVersion: definition.version,
    candidateState: "repository_ready",
    submissionReady: false,
    submissionBlockers: [
      "publisher identity and Apps Management authority are unverified",
      "availability selection is pending",
      "public deployment and exact-host evidence are unverified",
      "portal draft has not been created or reconciled",
    ],
    evidence: {
      repository: { state: "pass", detail: "canonical contract and deterministic source checks" },
      bundle: { state: "pass", detail: `${fileCount} inventoried files; inventory digest ${inventoryDigest}` },
      installed_host: { state: "unverified", detail: "PPD-L02 and PPD-L03 not performed" },
      portal: { state: "unverified", detail: contract.publisher.verificationState },
      post_publication: { state: "unverified", detail: "not published" },
    },
    externalState: {
      publisherIdentity: contract.publisher.verificationState,
      availability: contract.availability.decisionState,
      portal: "not_observed",
      publication: "not_observed",
    },
  };
}

export function renderReadinessReport(report) {
  const blockers = report.submissionBlockers.map((blocker) => `- ${blocker}`).join("\n");
  return `# AGDF Public Plugin Readiness\n\n- release: \`${report.releaseVersion}\`\n- candidate_state: \`${report.candidateState}\`\n- submission_ready: \`${report.submissionReady}\`\n\n## Evidence classes\n\n| Class | State | Detail |\n|---|---|---|\n${Object.entries(report.evidence).map(([name, value]) => `| ${name} | ${value.state} | ${value.detail} |`).join("\n")}\n\n## Submission blockers\n\n${blockers}\n\nRepository and bundle evidence do not prove installation, authenticated host behavior, publisher identity, portal state, deployment or publication.\n`;
}
