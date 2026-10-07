# App-specificatie — Reaction-game

> Vul dit document in voordat (of terwijl) features worden gebouwd.
> Coding agents behandelen dit als product-bron van waarheid naast `AGENTS.md`.

## Status

- [ ] Concept vastgelegd
- [ ] Schermen beschreven
- [ ] Acceptatiecriteria per feature
- [ ] Offline-gedrag per feature
- [ ] Klaar om te implementeren

## Samenvatting (1 alinea)

_Wat is de app? Voor wie? Wat is de kernactie in één zin?_

## Doelgroep & apparaten

- Primair: _bijv. mobiel (Android/iOS) als geïnstalleerde PWA_
- Secondair: _desktop browser_
- Oriëntatie: _portrait / landscape / beide_
- Toegankelijkheid: _minimale eisen (contrast, touch targets, …)_

## Niet-doelen

_Lijst wat bewust buiten scope is (accounts, multiplayer, native stores, …)._

## Functionele features

Kopieer dit blok per feature:

### Feature: _naam_

- **Beschrijving:**
- **User story:** Als … wil ik … zodat …
- **UI / schermen:**
- **Interactie:** taps, gestures, keyboard, …
- **Data:** wat wordt opgeslagen (localStorage / IndexedDB / niets)
- **Offline:** werkt volledig / gedeeltelijk / niet nodig
- **Acceptatiecriteria:**
  - [ ]
  - [ ]

## Schermen & navigatie

| Scherm | Pad / route | Doel | Navigatie naartoe |
| --- | --- | --- | --- |
| | | | |

## Game- of domeinregels

_Score, timing, levels, foutafhandeling, reset, …_

## Content & assets

_Icons, geluid, haptics, copy-tonality (NL), …_

## Modules / vertical slices (voor agents)

Noem per capability de voorziene slice-naam onder `src/features/` (functioneel,
niet technisch). Voorbeeld: `play-round`, `results`, `settings`. Agents houden
slices gescheiden (screaming architecture + SOLID) zodat refactoren makkelijk
blijft — zie `AGENTS.md` en `.cursor/rules/architecture.mdc`.

| Capability | Slice-map | Opmerkingen |
| --- | --- | --- |
| | | |

## Testbaarheid (voor agents)

Per feature in de lijst hierboven: noem wat geautomatiseerd getest moet worden
(bijv. scoreberekening, timingvensters, reset). Agents schrijven Vitest-tests
daarvoor en voeren `npm test` uit vóór afronden — zie `AGENTS.md` / DoD.

## Versie & update (productkeuzes)

Standaard uit agent-instructies (niet wijzigen tenzij nodig):

- Updateprompt in het Nederlands met knop **Vernieuwen**
- Versie zichtbaar voor support
- Check opnieuw bij terugkeer naar de app (foreground)

Afwijkingen t.o.v. standaard:

- _geen / beschrijf hier_

## Open vragen

1.
2.
