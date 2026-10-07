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
| Deploy | GitHub Actions → GitHub Pages | Build op `main`, publish `dist` |
| Package manager | npm | Lockfile committen |

Wijzig de stack niet zonder expliciete instructie van de gebruiker.

## Repository-conventies

- Broncode onder `src/`. Entry: `src/main.ts`, styles: `src/styles/`.
- Statische assets (icons, splash) onder `public/`.
- `base` in Vite = repository-naam op GitHub Pages project-site:
  `https://<user>.github.io/<repo>/` → `base: '/<repo>/'`.
  Voor dit repo: **`base: '/Reaction-game/'`** tenzij Pages later op een custom
  domain of user-site staat (dan documenteren in README en Vite `base` aanpassen).
- Geen secrets in de client. Alles wat in de browser draait is publiek.
- Geen onnodige dependencies. Prefereren van Web Platform APIs.

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

## GitHub Pages

- Workflow onder `.github/workflows/deploy-pages.yml`.
- Trigger: push naar `main` (en desgewenst `workflow_dispatch`).
- Build: `npm ci` → `npm run build` → upload `dist` → deploy naar Pages.
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

1. Werk `docs/app-spec.md` bij (acceptatiecriteria, schermen, data, offline-gedrag).
2. Commit de spec, daarna implementeren tegen die spec.
3. Houd PWA/update/deploy-gedrag intact bij elke feature.

### Definition of done (per feature of scaffold)

- [ ] `npm run build` slaagt lokaal
- [ ] Typecheck strict zonder errors
- [ ] Manifest + SW aanwezig in `dist`
- [ ] Versie zichtbaar in UI (of debug-footer)
- [ ] Updateprompt werkt (beschreven of handmatig geverifieerd)
- [ ] Deploy-workflow aanwezig en documentatie in README klopt
- [ ] Geen regressie op `base`-paden (assets laden onder `/Reaction-game/`)

## Wat agents niet mogen doen

- Native app stores, Capacitor/Cordova, of backend-servers introduceren tenzij gevraagd.
- Service worker uitschakelen “voor het gemak” in productie.
- `skipWaiting` zonder user-feedback bij breaking UI-changes — standaard is prompt + reload.
- Groot framework toevoegen zonder dat de spec dat vereist.
- Markdown/docs uitbreiden buiten `README.md`, `AGENTS.md`, `docs/*` en rules, tenzij gevraagd.

## Taal

- Code, identifiers, commit messages: **Engels**.
- Gebruikersgerichte UI-copy: **Nederlands**, tenzij `docs/app-spec.md` anders zegt.
- Agent-communicatie met de gebruiker: **Nederlands**.
