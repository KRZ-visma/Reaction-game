# Agent instructions — Reaction-game PWA

Canon voor coding agents. Product: [`docs/app-spec.md`](docs/app-spec.md).
Zonder features in die spec: alleen scaffold/infra; geen zelfbedachte gameplay.

Details: [`.cursor/rules/`](.cursor/rules/).

## Doel

TypeScript **PWA** op **GitHub Pages**, met betrouwbare **client-updates**
(ook op telefoon na installatie).

## Stack (vast)

| | |
| --- | --- |
| Bundler | Vite |
| Taal | TypeScript strict |
| UI | Vanilla TS + CSS (tenzij spec anders) |
| PWA | `vite-plugin-pwa` (Workbox) |
| Tests | Vitest (`*.test.ts` / `*.spec.ts`) |
| Deploy | GitHub Actions → Pages (`dist`) |
| Packages | npm + lockfile |

Stack wijzigen alleen op expliciete instructie.

## Architectuur

Succes = **makkelijk refactorbaar**. Wendbaar > premature abstractie.

- Modules op **functie/capability**, niet op technische lagen.
- **Screaming architecture** + **vertical slices** + **SOLID** (richtlijn, geen ceremonie).
- Dun `shared/`; feature-logica hoort in de slice.
- Cross-feature alleen via `index.ts` (liever: geen koppeling).

```text
src/
  main.ts                 # composition root
  app/                    # shell
  features/<feature>/     # ui/ + model/ + data?/ + index.ts + tests
  shared/                 # minimaal
  styles/
```

Zie `.cursor/rules/architecture.mdc`.

## Repo

- `base: '/Reaction-game/'` (Pages project-site).
- Assets: `public/`. Geen secrets in de client.
- Features importeren alleen elkaars publieke API.

## PWA & updates

Manifest + SW + installeerbaar + offline shell. Unieke build-versie zichtbaar in UI.
Update via prompt (**Vernieuwen**), niet stille `autoUpdate` als default.
Op foreground opnieuw `registration.update()`.
Zie `.cursor/rules/pwa-versioning.mdc`.

## Testen

Elke behavior change → tests bijwerken. **`npm test` lokaal groen** vóór done.
CI: `npm ci` → `npm test` → typecheck → `npm run build` → pas dan deploy.
Geen E2E tenzij de spec dat eist. Zie `.cursor/rules/testing.mdc`.

## Pages

`.github/workflows/deploy-pages.yml`: push `main` + `workflow_dispatch`.
Tests rood = geen deploy. Zie `.cursor/rules/github-pages.mdc`.

## Werkwijze

1. Lees `AGENTS.md`, rules, `docs/app-spec.md`.
2. Spec leeg → scaffold (Vite/TS/PWA/tests/Pages/update-slice). Geen spel verzinnen.
3. Spec gevuld → spec eerst bijwerken, daarna **één vertical slice** per keer.

## Definition of done

- [ ] Vertical slice onder `src/features/<name>/` (of bewuste `app/`/`shared/`)
- [ ] Geen lagen-dump (`components/`/`services/`/`utils/` als primaire structuur)
- [ ] Tests bijgewerkt; `npm test` groen (lokaal uitgevoerd)
- [ ] Typecheck + `npm run build` groen
- [ ] Manifest/SW in `dist`; versie zichtbaar; updateprompt ok
- [ ] CI draait tests vóór deploy; `base`-paden kloppen
- [ ] Blijft makkelijk refactorbaar

## Verboden

- Native wrappers/backends/frameworks zonder vraag of spec
- SW uitzetten in prod; stille guideline-breaks; bevestigingspraat
- Feature-logica in `shared/` zonder tweede echte consumer
- Extra markdown buiten `README.md`, `AGENTS.md`, `docs/*`, rules — tenzij gevraagd

## Communicatie & taal

Kort, duidelijk, krachtig. Geen lof of vulpraat. Verzoeken toetsen aan deze
richtlijnen; bij conflict: **verdedigen**, niet stil aanpassen. Override alleen
expliciet. Zie `.cursor/rules/communication.mdc`.

- Code/commits: Engels
- UI-copy: Nederlands (tenzij spec anders)
- Chat met gebruiker: Nederlands, in deze stijl
