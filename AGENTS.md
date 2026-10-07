# Agent instructions — Reaction-game PWA

Dit document is de bron van waarheid voor coding agents die aan dit project werken.
Productfunctionaliteit staat in [`docs/app-spec.md`](docs/app-spec.md). Zolang die
spec onvolledig is: **scaffold en infrastructuur wel**, feature-UI alleen volgens
wat daar expliciet staat.

## Doel

Bouw een **progressive web app (PWA)** in **TypeScript**, gehost op **GitHub Pages**,
met betrouwbaar **versiebeheer en automatische client-updates** (inclusief telefoon
na “Add to Home Screen”).

## Tech stack (vast)

| Onderdeel | Keuze | Toelichting |
| --- | --- | --- |
| Bundler / dev | Vite | Snelle builds, simpele GH Pages-output |
| Taal | TypeScript (strict) | Geen losse `.js` app-code |
| UI | Vanilla TS + CSS (tenzij `docs/app-spec.md` anders voorschrijft) | Lichtgewicht, ideaal voor games/PWA |
| PWA | `vite-plugin-pwa` (Workbox) | Precache, update-detectie, offline |
| Tests | Vitest (+ Testing Library alleen als DOM-tests nodig zijn) | Unit/integratie in TypeScript |
| Deploy | GitHub Actions → GitHub Pages | Build op `main`, publish `dist` |
| Package manager | npm | Lockfile committen |

Wijzig de stack niet zonder expliciete instructie van de gebruiker.

## Architectuur (wendbaar & modulair)

Het belangrijkste ontwerpprincipe is **modulaire ontwikkeling**: de codebase moet
**makkelijk refactorbaar** blijven. Een architectuur is hier “goed” als je een
feature kunt verplaatsen, herschrijven of verwijderen zonder een kettingreactie
door half de app. Wendbaarheid > premature abstracties.

Zie details en voorbeelden in [`.cursor/rules/architecture.mdc`](.cursor/rules/architecture.mdc).

### Kernregels

1. **Functionele scheiding van modules** — groepeer op *wat de gebruiker kan*
   (features/use cases), niet op technische lagen als primaire indeling
   (`components/`, `services/`, `utils/` als enigen structuur is fout).
2. **Screaming architecture** — open `src/` en je moet meteen zien *waar de app
   over gaat* (bijv. `play-round/`, `high-scores/`, `app-update/`), niet alleen
   frameworks of generieke mappen.
3. **Vertical slices** — lever per feature een doorsnede: UI + domeinlogica +
   persistatie/adapters + tests in één feature-map. Wijzigingen aan één feature
   blijven bij voorkeur binnen die map.
4. **SOLID als richtlijn, niet als dogma** — vooral:
   - **S**: één reden tot wijziging per module/bestand waar praktisch
   - **O/D**: afhankelijk van stabiele interfaces/ports; infra (DOM, storage,
     SW) achter dunne adapters
   - **I/L**: geen god-interfaces; gedrag vervangbaar zonder consumers te breken
5. **Dunne shared kernel** — `src/shared/` alleen voor echt gedeelde primitives
   (geen feature-logica “even centraal zetten”). Liever dupliceren tot een
   tweede gebruik een extractie rechtvaardigt.
6. **Refactorbaarheid eerst** — vermijd vroege frameworks-in-frameworks,
   diepe inheritance, en globale singletons. Prefereren: pure functies, kleine
   modules, expliciete dependencies, feature-lokale state.

### Richtlijn-indeling (na scaffold)

```text
src/
  main.ts                 # composition root: wire slices, geen business logic
  app/                    # shell: routing/nav, layout host
  features/
    <feature-name>/       # één vertical slice (schreeuwt de domeinnaam)
      ui/
      model/              # pure domeinlogica
      data/               # storage/adapters (optioneel)
      index.ts            # publieke API van de slice
      *.test.ts
  shared/                 # minimaal; geen feature-lekkage
  styles/
```

Feature-namen en slices volgen `docs/app-spec.md`. Infrastructuur-slices
(bijv. `app-update` voor de PWA-updateprompt) mogen bestaan; die zijn ook
functioneel begrensd.

## Repository-conventies

- Broncode onder `src/`, georganiseerd als hierboven (features = modules).
- Entry/composition root: `src/main.ts`. Globale styles: `src/styles/`.
- Statische assets (icons, splash) onder `public/`.
- `base` in Vite = repository-naam op GitHub Pages project-site:
  `https://<user>.github.io/<repo>/` → `base: '/<repo>/'`.
  Voor dit repo: **`base: '/Reaction-game/'`** tenzij Pages later op een custom
  domain of user-site staat (dan documenteren in README en Vite `base` aanpassen).
- Geen secrets in de client. Alles wat in de browser draait is publiek.
- Geen onnodige dependencies. Prefereren van Web Platform APIs.
- Importeer andere features alleen via hun `index.ts` (publieke API); geen
  deep-imports in interne bestanden van een andere slice.

## Verplichte PWA-eigenschappen

1. **Web App Manifest** (`name`, `short_name`, `start_url`, `display: standalone`,
   `background_color`, `theme_color`, icons 192 + 512, `purpose` waar nodig).
2. **Service worker** via Workbox (generateSW of injectManifest — kies één en blijf
   daarbij). Precache van build-assets; runtime-caching alleen als de spec dat vraagt.
3. **Installeerbaar** op mobiel (geldige manifest + SW + HTTPS via Pages).
4. **Updateflow** zoals beschreven in
   [`.cursor/rules/pwa-versioning.mdc`](.cursor/rules/pwa-versioning.mdc).
5. **Offline**: app-shell laadt offline na eerste bezoek. Feature-data volgens spec.

## Versie & automatische update (niet optioneel)

Elke productiebuild moet een **zichtbare, unieke versie** meenemen (bijv. uit
`package.json` + korte git SHA of build timestamp), geïnjecteerd als
`import.meta.env`-achtige constante.

Op de client:

1. Detecteer een wachtende service worker (`updatefound` / `controllerchange` /
   Workbox `registerType: 'prompt'` of equivalent).
2. Toon een **duidelijke UI** (“Nieuwe versie beschikbaar”) met actie **Vernieuwen**.
3. Bij bevestiging: activeer de nieuwe SW (`skipWaiting`) en **reload** alle clients.
4. Optioneel (specificeer in UI): stille check bij `visibilitychange` / interval
   zodat een telefoon die dagen open blijft alsnog een update ziet zonder app-store.

Zie details en verboden patronen in `.cursor/rules/pwa-versioning.mdc`.

## Testen (verplicht)

- Testrunner: **Vitest**, geïntegreerd met Vite. Script: `npm test` (en
  `npm run test:coverage` als coverage is ingericht).
- Plaats tests naast of onder `src/` als `*.test.ts` / `*.spec.ts`.
- Test pure logica (spelregels, timing, score, versie-helpers) met unit tests.
- Test DOM/update-UI met lichte component- of integratietests waar dat waarde
  toevoegt; geen E2E-framework tenzij de spec dat eist.
- Elke nieuwe feature of bugfix **moet** bijbehorende tests krijgen of
  bestaande tests uitbreiden voordat de wijziging “done” is.
- Agents **moeten** de tests lokaal uitvoeren (`npm test`) en pas afronden als
  die groen zijn. Rood laten en “later fixen” is niet toegestaan.
- CI (deploy-workflow of aparte `ci.yml`): `npm ci` → `npm test` → typecheck →
  `npm run build`. Deploy alleen na geslaagde tests.

Zie `.cursor/rules/testing.mdc`.

## GitHub Pages

- Workflow onder `.github/workflows/deploy-pages.yml`.
- Trigger: push naar `main` (en desgewenst `workflow_dispatch`).
- Pipeline: `npm ci` → `npm test` → typecheck → `npm run build` → upload `dist`
  → deploy naar Pages. Tests falen = geen deploy.
- `404.html` kopie van `index.html` alleen als client-side routing nodig is.
- Documenteer in README: Pages-source = GitHub Actions, URL, en hoe je force-update
  test (hard refresh / “Vernieuwen”-knop na deploy).

Zie `.cursor/rules/github-pages.mdc`.

## Werkwijze voor agents

### Fase A — nu (instructies + later scaffold)

1. Lees `AGENTS.md`, `.cursor/rules/*`, en `docs/app-spec.md`.
2. Als de app-spec nog geen features heeft: **niet** zelf een speelconcept verzinnen.
   Wel toegestaan: lege Vite+TS+PWA+Pages scaffold met update-UI en versiebadge.
3. Als de app-spec wél features heeft: implementeer precies die scope; geen scope creep.

### Fase B — wanneer de gebruiker functionaliteit beschrijft

1. Werk `docs/app-spec.md` bij (acceptatiecriteria, schermen, data, offline-gedrag,
   slice-namen).
2. Commit de spec, daarna **per vertical slice** implementeren tegen die spec.
3. Houd architectuurgrenzen, PWA/update/deploy-gedrag en tests intact bij elke feature.

### Definition of done (per feature of scaffold)

- [ ] Feature als **vertical slice** onder `src/features/<name>/` (of bewust
      gedeelde shell onder `src/app/` / `src/shared/`), functioneel begrensd
- [ ] Geen nieuwe technische dumping-ground mappen; screaming names behouden
- [ ] Publieke API via feature-`index.ts`; geen onnodige cross-feature coupling
- [ ] Relevante unit/integratietests geschreven of bijgewerkt (bij voorkeur op `model/`)
- [ ] `npm test` lokaal uitgevoerd en **groen** (agent toont of bevestigt resultaat)
- [ ] Typecheck strict zonder errors
- [ ] `npm run build` slaagt lokaal
- [ ] Manifest + SW aanwezig in `dist`
- [ ] Versie zichtbaar in UI (of debug-footer)
- [ ] Updateprompt werkt (beschreven of handmatig geverifieerd)
- [ ] CI/deploy-workflow draait tests vóór build/deploy
- [ ] Deploy-workflow aanwezig en documentatie in README klopt
- [ ] Geen regressie op `base`-paden (assets laden onder `/Reaction-game/`)
- [ ] Resultaat blijft **makkelijk refactorbaar** (kleine modules, duidelijke grenzen)

## Wat agents niet mogen doen

- Native app stores, Capacitor/Cordova, of backend-servers introduceren tenzij gevraagd.
- Service worker uitschakelen “voor het gemak” in productie.
- `skipWaiting` zonder user-feedback bij breaking UI-changes — standaard is prompt + reload.
- Groot framework toevoegen zonder dat de spec dat vereist.
- Lagen-eerst structuur (`components/`, `services/`, `utils/` als primaire indeling)
  in plaats van feature-slices.
- Feature-logica in `shared/` parkeren “voor hergebruik” zonder tweede echte consumer.
- Richtlijnen stilzwijgend negeren of afzwakken wanneer de gebruiker iets vraagt
  dat ermee botst — pushback is verplicht (zie Communicatie).
- Bevestigings- of vulpraat in plaats van inhoud.
- Markdown/docs uitbreiden buiten `README.md`, `AGENTS.md`, `docs/*` en rules, tenzij gevraagd.

## Communicatie

Zie [`.cursor/rules/communication.mdc`](.cursor/rules/communication.mdc).

- **Kort, duidelijk, krachtig.** Geen opvulling, geen herhaling van de vraag,
  geen lange inleidingen. Zeg wat er is gedaan, wat er openstaat, of wat er mis
  is — en stop.
- **Geen bevestigingspraat.** Geen “goed punt”, “daar had ik niet aan gedacht”,
  “uitstekend idee”, of andere sociale validatie. De gebruiker vraagt om werk en
  oordeel, niet om aanmoediging.
- **Kritisch op verzoeken.** Toets elke vraag/instructie aan `AGENTS.md` en
  `.cursor/rules/*`. Als iets botst (stack, architectuur, tests, PWA-updates,
  scope, DoD): **verdedig de richtlijn**. Niet stilzwijgend negeren, niet
  “even aanpassen” om de gebruiker te volgen, niet half toepassen.
- Bij conflict: benoem in één tot drie zinnen *welke* richtlijn, *waarom* die
  geldt, en *welk alternatief* wél past — wacht op expliciete override als de
  gebruiker de richtlijn bewust wil breken.
- Onduidelijke of tegenstrijdige instructies: kort benoemen wat schuurt; niet
  gokken in strijd met vastgelegde regels.

## Taal

- Code, identifiers, commit messages: **Engels**.
- Gebruikersgerichte UI-copy: **Nederlands**, tenzij `docs/app-spec.md` anders zegt.
- Agent-communicatie met de gebruiker: **Nederlands**, in de stijl hierboven.
