# Private AGDF Core

`@agdf/core` owns control state, rule validation, dispatch and inspection. It has
no CLI, MCP, SDK, installer, build or evaluation dependency and starts no processes.
The CLI provides Git observation, recovery history, executable probes and terminal
interaction through explicit dependencies. Missing providers grant no approval.

`lib/resources/context.js` creates validated immutable package-bound metadata;
`lib/resources/contracts.js` reads only declared modules. Root build tools derive
`generated/` from `plugins/agdf/`. `createCoreServices` composes dispatch/inspection
with resources and observers without a mutable global registry.

This package is private. Root assembly embeds `lib/` into the existing public
`create-agdf` product, with a generated resource descriptor and internal aliases.
See [package architecture](../../docs/architecture/package-structure.md).
