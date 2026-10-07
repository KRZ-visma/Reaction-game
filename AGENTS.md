# Agent instructions — Reaction-game PWA

Canon. Product: [`docs/app-spec.md`](docs/app-spec.md). Spec leeg → alleen scaffold/infra.
Uitwerking: [`.cursor/rules/`](.cursor/rules/).

## Doel

TypeScript PWA op GitHub Pages met betrouwbare client-updates (ook na installatie op telefoon).

## Stack (vast)

| | |
| --- | --- |
| Bundler | Vite |
| Taal | TypeScript strict |
| UI | Vanilla TS + CSS (tenzij spec anders) |
| PWA | `vite-plugin-pwa` (Workbox) |
| Tests | Vitest |
| Deploy | GitHub Actions → Pages (`dist`) |
| Packages | npm + lockfile |

Wijzigen alleen op expliciete instructie.

## Architectuur

Succes = makkelijk refactorbaar.
Capability-slices (`src/features/<name>/`), screaming names, SOLID, dun `shared/`.
Zie `.cursor/rules/architecture.mdc`.

## PWA, tests, Pages

- Updates: prompt **Vernieuwen**; versie zichtbaar. → `pwa-versioning.mdc`
- Tests: bij elke change; `npm test` lokaal groen vóór done. → `testing.mdc`
- Deploy: `deploy-pages.yml`; tests rood = geen deploy; `base: '/Reaction-game/'`. → `github-pages.mdc`
- Scope/scaffold: → `scaffold.mdc`

## Werkwijze

1. Spec leeg → scaffold. Geen gameplay verzinnen.
2. Spec gevuld → eerst spec, dan één vertical slice tegelijk.

## Definition of done

- [ ] Slice onder `src/features/<name>/` (of bewust `app/`/`shared/`)
- [ ] Geen lagen-dump als primaire structuur
- [ ] Tests bijgewerkt; `npm test` lokaal groen
- [ ] Typecheck + `npm run build` groen
- [ ] Manifest/SW in `dist`; versie + updateprompt ok
- [ ] CI test vóór deploy; `base`-paden kloppen
- [ ] Blijft makkelijk refactorbaar

## Verboden

Native wrappers/backends/extra frameworks zonder vraag of spec.
SW uitzetten in prod. Feature-logica in `shared/` zonder tweede consumer.
Richtlijnen stil afzwakken. Extra markdown buiten README/AGENTS/docs/rules zonder vraag.

## Communicatie & taal

Snijtest + geen lof + richtlijnen verdedigen: `.cursor/rules/communication.mdc`.
Code/commits: Engels. UI-copy + chat: Nederlands.
