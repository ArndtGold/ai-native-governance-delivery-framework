# User Requirement: Add a Contact Email to Pages

## Work Item

- key: `pages-contact-email`
- title: Add the public AGDF contact email to the Pages footer
- status: approved
- approval: `Approval: UR` received on 2026-07-15

## User Need

Visitors to the public AGDF Pages site need a clear way to contact the project by email. The site should expose `agdf@iself.eu` in the existing footer as a visible, accessible email link.

## Desired Behavior

1. Add a `Contact` link to the existing Pages footer.
2. The link opens the visitor's email client through `mailto:agdf@iself.eu`.
3. Keep the contact address in the existing canonical Pages site data when that fits the current ownership pattern.

## Acceptance Criteria

1. The footer visibly exposes a contact link for `agdf@iself.eu`.
2. The rendered link target is exactly `mailto:agdf@iself.eu`.
3. Existing footer links, layout and responsive behavior remain intact.
4. No contact form, new route, tracking or external service is introduced.
5. Pages checks and build pass.

## Scope Boundary

In scope: the canonical Pages site data and the minimal footer rendering change.

Out of scope: a contact form, mailbox configuration, privacy-policy changes, new routes, analytics, commits, pushes, pull requests and releases.

## Evidence And Approval

- public site data owner: `pages/src/data/site.ts`.
- footer renderer: `pages/src/pages/index.astro`.
- approval: exact `Approval: UR` received on 2026-07-15 after run and gate revalidation.
