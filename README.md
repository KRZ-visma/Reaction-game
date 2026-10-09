# Reaction-game

TypeScript PWA op GitHub Pages: verzamel bolletjes via de camera in één timed pot.

| Doc | Rol |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | Canon |
| [`docs/app-spec.md`](docs/app-spec.md) | Product |
| [`.cursor/rules/`](.cursor/rules/) | Uitwerking |

## Lokaal

```bash
npm ci
npm test
npm run dev
```

Productie-build: `npm run build` → `dist/` (base `/Reaction-game/`).

## Deploy

Push naar `main` triggert [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml): test → typecheck → build → GitHub Pages.
