<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- AI calls live in src/lib/*.functions.ts server functions with zod-bounded input; output rendered as plain text (no HTML) to avoid injection.
- Referentials (categories, positions, statuses) live only in src/config/referentiels.ts; components never hardcode them, so the API can replace one module.
- Connected-space mock data lives in src/data/mock-espaces.ts and cross-page demo state in src/lib/mock-store.ts (in-memory, never presented as persisted).
- Sensitive player data (minors, guardians, emergency contacts) is typed separately (PlayerPrivate) and must never be read by public routes.
