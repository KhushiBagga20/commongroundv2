# CommonGround — Creative Architecture

> FIND YOUR PEOPLE. FIND YOUR WEIRD.

This document is the Stage 1 output: the decisions every screen is built on.
It is deliberately opinionated so that the five spaces read as one universe.

---

## 1. The idea in one line

CommonGround is a **pocket universe you operate like a retro machine**.
You don't browse pages; you switch *channels* on a chunky keyboard deck, and
each channel is a different little world with its own light, weather and
personality.

Three material worlds, borrowed from the references and recombined:

| World            | Where it shows up                         | Ingredients |
|------------------|-------------------------------------------|-------------|
| **Paper**        | Playground hero, Collection, room content | butter / paper grounds, paper grain, ink outlines, hard offset shadows, flat editorial illustration |
| **Midnight**     | Swipe Machine, Curiosity Slot, overlays   | ink-midnight grounds, halftone dot fields, neon accents (acid, bubblegum, tangerine), expressive faces, condensed type |
| **Plastic**      | Navigation, controls, selected states     | glossy 3D keycaps, LEDs, pixel legends, mechanical press-and-rebound |

Rule of thumb: **paper is for reading, midnight is for drama, plastic is for doing.**

## 2. Information architecture

Five spaces, one keyboard. Every route is reachable from the Keydeck (or keys `1`–`5`).

```
01 PLAYGROUND   /                      the interactive poster + intro sequences
02 SWIPE        /swipe                 Hobby Tinder, reinvented as an arcade cabinet
03 RABBIT HOLE  /rabbit-hole           force-directed constellation of hobbies (+ list view)
04 CLUBHOUSE    /clubhouse             a hallway of doors (rooms)
                /clubhouse/:roomId     inside a room: board · projects · happenings · people
05 COLLECTION   /collection            your scrapbook: pass, shelves, stamps, badges

Overlay (any space)   ?h=<hobbyId>      Hobby Dossier sheet — deep-linkable, closes with Back
Overlay (any space)   Pass dialog       create / edit your local "pass" (entry flow)
```

The core loop the IA serves: **swipe → dig → enter a room → collect**.
Each space hands off to the next (the dossier links to the Rabbit Hole and to rooms; rooms link
back to hobbies; the Collection reflects everything).

## 3. Navigation concept — The Keydeck

A floating control panel docked at the bottom: five glossy keycaps on an ink chassis, each with a
pixel number legend, an icon and a plain-language label. The active space's key is **locked down**
with its LED lit. Labels are always visible (brand names on desktop, functional names on mobile:
Home · Swipe · Explore · Rooms · You). Nothing essential lives behind a mystery interaction.

Top corners carry two small paper pills: the wordmark (home) and your status (into-it count,
motion toggle, shortcuts help).

## 4. Motion language

Motion is physical. Everything has **mass**, nothing teleports.

| Behaviour      | Spec |
|----------------|------|
| `press`        | key/button travels down its own depth, shadow collapses (60 ms), rebounds on a CSS `linear()` spring with ~15% overshoot |
| `snappy`       | stiffness 520 / damping 32 — UI state changes |
| `bouncy`       | stiffness 420 / damping 14 — stickers, celebrations |
| `heavy`        | stiffness 260 / damping 28 / mass 1.3 — cards settling into a stack |
| `gentle`       | stiffness 140 / damping 20 — camera moves, sheets |
| throw          | released objects inherit pointer velocity (cards, stickers, map pan) |
| ambient        | slow CSS keyframes only, paused off-screen and in hidden tabs |

**Channel change (page transition):** a disc in the destination's colour expands from where you
clicked (300 ms, ease-in) carrying the channel number and name, then the disc lifts away as a curved
wipe (450 ms) while the new space rises 24 px into place. Within-space changes (dossier, tabs) never
use the curtain.

**Calm mode:** follows `prefers-reduced-motion` by default, with a manual override in the top-right.
Calm removes the curtain, parallax, ambient loops, cursor aura and throw physics, and keeps opacity
fades and instant state changes.

## 5. Cursor & touch

- Desktop (`pointer: fine`): the native cursor stays; a soft ink **aura** trails it and shows a
  context word (`drag`, `swipe`, `open`, `pull`, `pan`) over objects that do something special.
  It hides over text inputs.
- Proximity: hero objects lean toward the cursor, faces change expression as it approaches,
  primary CTAs are magnetic.
- Touch: no aura, no hover dependency. Everything that reacts to hover has a tap or drag equivalent,
  and the large gestures (swipe, pan, pinch, throw) are native to touch.

## 6. Typography

| Role     | Face | Use |
|----------|------|-----|
| Display  | **Archivo** variable (wght 100–900, wdth 62–125) | condensed heavy poster headlines; the hero headline animates `wdth`/`wght` per letter by cursor proximity |
| Retro    | **Space Mono** | labels, metadata, quest IDs, counters |
| Pixel    | **Silkscreen** | keycap legends, LCD readouts, tiny decorative tags |
| Body     | **DM Sans** | descriptions, threads, forms |

## 7. Colour system

The nine brand colours, plus derived `--ink-deep` (midnight) and `--electric-deep` (text-safe blue).
Each hobby gets one of nine **swatches** (bg / fg / main / alt) so every poster has an identity
while staying inside the system. Body text never sits on electric blue (it fails AA at small sizes);
posters put copy on a paper label panel.

## 8. Illustration system

All original SVG, drawn in code:

- **Hobby art** — 39 flat editorial objects in a 200×200 box, 4 px ink line, swatch fills,
  halftone shading, and faces on about a dozen of them (moods: idle, happy, wow, meh, sleepy).
- **Pip** — the mascot: a butter-yellow seedling-creature with a tangerine petal crown and a leaf
  sprout. Eyes track the cursor, blinks on its own, has 8 moods, gets dizzy if poked too much.
- **Procedural** — halftone discs, member avatars (deterministic faces from a seed), rubber stamps
  with text on a circular path, poster compositions seeded by hobby id.

No emoji, no stock photos, no generated bitmaps.

## 9. Component architecture

```
src/
  styles/        tokens, base, materials (keycap, ink button, sticker, halftone), per-space CSS
  lib/           tiny pure helpers (seeded random, class names, formatting)
  data/          typed catalogue (hobbies, connections, rooms, people, achievements) + repository
  store/         zustand: collector (persisted user state) and ui (toasts, dialogs)
  motion/        spring presets, calm-mode, transition origin
  hooks/         pointer, magnetic, keyboard shortcuts, offscreen pause, dossier, secrets
  art/           hobby illustrations, Pip, avatars, stamps, stickers, halftone
  components/    layout (shell, keydeck, curtain, cursor), ui primitives, hobby poster + dossier
  spaces/        playground · swipe · rabbit-hole · clubhouse · collection
```

**Data seam:** catalogue content is read only through `data/repository.ts`; user state is changed
only through actions on the `collector` store. A backend replaces the repository with fetchers and
syncs the store's actions — no component imports raw data files directly.

## 10. Honesty about the prototype

- All social content (threads, members, events) is **demo data**. Anything you post, join or RSVP is
  stored only in this browser and labelled `DEMO · LOCAL`.
- No accounts, no network writes, no fake "live" counters presented as real.
- Three.js / R3F is intentionally **not** used: keycaps, doors and card flips are CSS 3D, the graph is
  DOM + SVG with a small custom force simulation. Nothing here benefits from WebGL enough to pay for it.
