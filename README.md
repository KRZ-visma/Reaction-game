# Reaction-game

Progressive web app (TypeScript), gehost op GitHub Pages, met automatische
client-updates via een service worker.

## Status

**Fase: agent-instructies.** De app zelf wordt gebouwd zodra
[`docs/app-spec.md`](docs/app-spec.md) is ingevuld met functionaliteit.

## Voor agents / contributors

| Document | Inhoud |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | Stack, architectuur, PWA, testen, communicatie, DoD |
| [`.cursor/rules/`](.cursor/rules/) | Architectuur, communicatie, versiebeheer, Pages, testing, scope |
| [`docs/app-spec.md`](docs/app-spec.md) | Productfeatures (nog in te vullen) |

## Geplande stack & architectuur

- Vite + TypeScript
- Vitest (`npm test` verplicht groen vóór done/deploy)
- PWA via `vite-plugin-pwa` (Workbox)
- Deploy: GitHub Actions → GitHub Pages (`/Reaction-game/`)
- Modulair: screaming architecture, vertical slices, SOLID; optimaliseer voor
  eenvoudig refactoren

## Volgende stap

Beschrijf in `docs/app-spec.md` (of in chat) de gewenste functionaliteit:
schermen, spelregels, offline-gedrag, acceptatiecriteria. Daarna kan een agent
de scaffold en features bouwen volgens `AGENTS.md`.
