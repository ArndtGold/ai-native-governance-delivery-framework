# Frozen pre-feature control runtime

`agdf-0.20.2-control-v2.json.gz` preserves 69 exact production files from the installed pre-feature AGDF 0.20.2 generation, including the parser, creation writer, transitive Core sources and required versioned metadata. It is a source snapshot, not a reimplementation of the old version check. The loader verifies the archive and every original file digest, recreating the original package-relative paths in a disposable directory.

Provenance is embedded in the archive: base commit `8e482d913289f0d2b466128d6d2a0d8b5815f0a3`, generation `e50d68ccd7a90661770a7586a1bdb73498a94ed101ee32666782f78354d8743b`, runtime digest `b932c679a51f6772ba363d6acc0d0cab211139575bd5573458b8fb63fd0f35ea`. This local generation includes the separately reviewed authoring-routing repair; it predates planned URs and accepts only control-state v2. It is not evidence of a new release or host qualification.

The snapshot was captured from the actual immutable generation using the production parser/creation static import graph observed by the repository-pinned Rolldown compiler, without changing source bytes. Package metadata and the four JSON resources required by its resource context were copied from the same generation. Do not regenerate this fixture from current Core sources. Any deliberate replacement must preserve an evidenced pre-feature runtime, update provenance/digests and execute the real rejection/creation cases again.

The fixture is test-only and excluded from published Core runtime assets. Existing repository licensing applies.
