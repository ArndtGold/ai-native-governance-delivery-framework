// Exercise the same transaction owner/checkpoints with the new versioned proof.
process.env.AGDF_TEST_REVISION_POLICY = '2';
await import('./run-command-revision-test.js');
