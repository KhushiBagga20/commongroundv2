# CommonGround

**Find your people. Find your weird.**

A digital playground for the chronically curious: swipe hobbies like trading cards, follow the strings between them, walk into rooms full of people who are into the same strange things, and keep it all in a scrapbook.

This is v2 — rebuilt from scratch as an interactive prototype. The design rationale lives in [`docs/CREATIVE_ARCHITECTURE.md`](docs/CREATIVE_ARCHITECTURE.md).

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
npm test           # unit tests (vitest)
npm run lint       # oxlint
```

## The five spaces

Switch between them with the Keydeck at the bottom, or keys `1`–`5`.

| # | Space | Route | What it does |
|---|-------|-------|--------------|
| 01 | **Playground** | `/` | The interactive poster: a kinetic headline, throwable hobby objects, a curiosity slot machine, a scroll story, a rooms reel and a sticker board. |
| 02 | **Swipe Machine** | `/swipe` | Hobby Tinder as an arcade cabinet. Right = into it, left = nah, up = save for later. Flip, undo, filter by category, open the stash. |
| 03 | **Rabbit Hole** | `/rabbit-hole` | A force-directed map of 39 hobbies and 84 connections. Pan, zoom, drag stickers, follow strings, keep a trail. Includes a searchable list view. |
| 04 | **Clubhouse** | `/clubhouse`, `/clubhouse/:roomId` | A hallway of eleven doors. Inside a room: board, projects, happenings and people. Join, post, pin projects, RSVP, complete weekly quests. |
| 05 | **Collection** | `/collection` | Your scrapbook: flip cards with notes, a clothesline of maybes, passport stamps, a receipt of activity, a badge cabinet, and decorate mode. |

Any hobby's **dossier** opens as a sheet from anywhere via `?h=<hobbyId>` and closes with Back.

## What's real and what's demo

- **Real (in this browser only):** your pass, swipes, saved hobbies, notes, discovered hobbies, joined rooms, quests, RSVPs, threads, replies, pinned projects, waves, stickers, badges and motion preference. Everything persists to `localStorage` under `commonground:collector`, and you can clear it from the Collection.
- **Demo:** the people, threads, projects, events and member counts. Anything you post is labelled `DEMO · LOCAL`, isn't sent anywhere, and nobody else can see it.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 (plus hand-written CSS for the materials) · Motion for React · GSAP + ScrollTrigger · Zustand · React Router · Lucide icons.

Three.js / R3F is intentionally **not** used: keycaps, doors and card flips are CSS 3D, and the graph is DOM + SVG driven by a small custom force simulation.

## Project layout

```
src/
  styles/        tokens, base, materials (keycap, ink button, halftone), per-space CSS
  data/          typed catalogue + repository.ts (the only door into data)
  store/         collector (persisted user state), ui (toasts, dialogs)
  motion/        spring presets, calm mode, transition origin
  hooks/         pointer, magnetic, hotkeys, offscreen pause, dossier, drag-scroll, gsap
  art/           hobby illustrations, Pip, avatars, stamps, stickers, badges, halftone
  components/    layout (shell, Keydeck, curtain, cursor aura), ui primitives, hobby, pass
  spaces/        playground · swipe · rabbit-hole · clubhouse · collection
```

**Connecting a backend:** replace the functions in `src/data/repository.ts` with fetchers, and sync the actions in `src/store/collector.ts`. Components never import raw data files.

## Motion & accessibility

- **Calm mode** follows `prefers-reduced-motion`. You can override it with the ⚡/🪶 toggle (top right) or in the help panel (`?`). It turns off the channel-change curtain, parallax, ambient loops, the cursor aura and momentum.
- Ambient animation pauses when it's off-screen or the tab is hidden.
- Everything draggable has a button or keyboard equivalent:
  - Swipe: arrow keys, `Space` to flip, `Z` to undo, `I` for the dossier.
  - Map: `+` / `−` / `0`, arrow keys to pan, `/` to search, and a list view.
- Dialogs and sheets trap focus, close with Esc, and restore focus afterwards.
- The custom cursor never replaces the native one and hides over text fields. Touch devices don't get it at all.

## Secrets

There are a few. None of them are required for anything.
