# App-spec — Reaction-game

Canon naast dit bestand: `AGENTS.md`.

## Status

- [x] Concept
- [x] Schermen
- [x] Acceptatiecriteria
- [x] Offline per feature
- [x] Klaar om te bouwen

## Samenvatting

Reactie-PWA voor telefoon/tablet: verzamel in één pot zo veel mogelijk bolletjes via de camera. De speler ziet zichzelf fullscreen; bolletjes verschijnen over het camerabeeld. Kernactie: elke gedetecteerde hand wordt een rondje op een vierkantje; daarmee vang je de bolletjes vóór de tijd om is.

## Doelgroep

Primair: spelers op telefoon/tablet (staand of zittend voor de camera).  
Secondair: desktop met webcam (zelfde flow).  
Oriëntatie: portrait-first; landscape mag.  
A11y-minimum: grote touch-targets op setup/eind; zichtbare countdown en score; geen alleen-kleur-signaal voor collect.

## Niet-doelen

- Accounts, multiplayer, leaderboards, social share
- Native apps / backends
- Extra spelmodi buiten de eerste pot (tot aparte spec)
- Marketing, analytics, push

## Features

### Feature: Bolletjes-pot

- Beschrijving: Eerste beleving. Speler kiest 1 of 2 minuten, start het spel, camera detecteert de speler, countdown 3–2–1, daarna zo veel mogelijk bolletjes verzamelen tot de tijd om is.
- User story: Als speler wil ik in één timed pot bolletjes vangen met een rondje op een vierkantje op mijn handen, zodat ik mijn reactie en score zie.
- UI:
  - Setup: merk/titel, keuze duur (1 min / 2 min), knop **Start**
  - Speelscherm: fullscreen camerabeeld (mirrored), bolletjes-overlay, per hand een rondje op een vierkantje, score, resterende tijd
  - Detectie: hint “Laat je handen zien…” tot minstens één hand gedetecteerd is
  - Countdown: groot 3, 2, 1 over het beeld; vangers al zichtbaar
  - Einde: score + **Opnieuw**
- Interactie:
  1. Kies duur → Start → camera-toestemming
  2. Hand detecteren → countdown → spelen
  3. Bolletjes spawnen op willekeurige plekken. Elke hand wordt een rondje op een vierkantje; overlap daarmee = verzameld (+1)
  4. Timer 0 → eindscherm
- Data: alleen runtime (duurkeuze, score, fase); geen persistence verplicht
- Offline: app-shell + assets via SW; MediaPipe-model na eerste succesvolle load uit cache (eerste load mag netwerk)
- Acceptatiecriteria:
  - [ ] Speler kan 1 of 2 minuten kiezen vóór start
  - [ ] Na Start vraagt de app camera en toont fullscreen live beeld
  - [ ] Spel wacht tot een hand in beeld is, daarna countdown 3–2–1, daarna spelen
  - [ ] Bolletjes zichtbaar over het camerabeeld; elke hand is een rondje op een vierkantje; overlap daarmee verhoogt de score
  - [ ] Pot stopt na gekozen duur; eindscore zichtbaar; Opnieuw terug naar setup
  - [ ] Versie zichtbaar; updateprompt volgens PWA-regels
- Te testen: domein (fases, timer, spawn/collect, score); UI-smoke zonder echte camera waar mogelijk
- Slice (`src/features/…`): `bolletjes-pot` (+ bestaande `app-update`)

### Feature: App-update (scaffold)

- Beschrijving: Zichtbare build-versie; prompt bij nieuwe SW (**Vernieuwen** / Later)
- Slice: `src/features/app-update/`

## Schermen

| Scherm | Route | Doel | Vanaf |
| --- | --- | --- | --- |
| Setup | `/` (hash) | Duur kiezen, starten | App open / Opnieuw |
| Detectie | `/` | Wachten op een hand in beeld | Na Start + camera ok |
| Countdown | `/` | 3–2–1 | Na detectie |
| Spelen | `/` | Bolletjes verzamelen | Na countdown |
| Einde | `/` | Score tonen, opnieuw | Timer 0 |

## Domeinregels

1. Duur: uitsluitend `60` of `120` seconden; default `60`.
2. Fases: `setup` → `camera` → `detecting` → `countdown` → `playing` → `finished` (of terug naar `setup` via Opnieuw / fout).
3. Countdown: exact de waarden 3, 2, 1; speeltijd start na “1”.
4. Bolletje: cirkel op genormaliseerde coords (0–1) over het beeld; radius vast genoeg voor touch/hand op mobiel.
5. Spawn: tijdens `playing` periodiek nieuwe bolletjes tot een max tegelijk op het scherm; geen overlap met bestaande binnen minimale afstand.
6. Collect: per zichtbare hand één vanger. Het vierkantje staat op de handpalm, het rondje zit er bovenop. Bolletje overlapt rondje of vierkantje → bolletje weg, score +1. Losse vingerpunten vangen niet.
7. Camera: voorkeur `environment` niet verplicht; `user` (selfie) mirrored voor natuurlijke sturing.
8. Geen score opslaan tussen sessies (v1).

## Content / assets

- UI-copy Nederlands
- MediaPipe Hand Landmarker voor de handen; elke hand wordt een rondje op een vierkantje
- PWA-iconen / manifest naam: Reaction-game

## Update — alleen afwijkingen

Geen; standaard `pwa-versioning.mdc`.

## Open

1. Geluid bij collect/countdown — later, niet blokkerend
2. Highscore lokaal — latere slice
