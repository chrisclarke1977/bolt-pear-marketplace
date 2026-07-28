# PearMarket

A peer-to-peer marketplace built on Pear (Holepunch) with over-the-air updates.

## Architecture

PearMarket runs on both desktop (Electron + Pear runtime) and mobile (React Native + BareKit).

### Desktop (Electron)

```
electron/main.cjs    → Electron main process, Pear runtime, OTA updates
electron/preload.cjs → Context bridge exposing worker IPC to renderer
workers/main.cjs     → Pear worker (Bare runtime): Corestore + Hyperswarm + market logic
workers/market.js    → Shared marketplace P2P logic (used by both desktop and mobile)
src/                 → React renderer (Vite)
```

### Mobile (React Native + BareKit)

```
workers/main-mobile.cjs → Pear worker for BareKit Worklet (same P2P logic, different IPC)
src/mobileBridge.ts     → Bridge adapter wrapping react-native-bare-kit Worklet IPC
src/marketClient.ts     → Auto-detects platform (electron / mobile / web)
```

The mobile worker uses `react-native-bare-kit`'s `Worklet` class to run Bare (the Pear
runtime) in an isolated thread on iOS/Android. IPC flows through `BareKit.IPC` (a streamx
Duplex), wrapped in `FramedStream` for length-prefixed messages — matching the desktop
worker's protocol so `workers/market.js` is shared verbatim.

### Platform Detection

`MarketClient` auto-detects the platform:
- `window.bridge` present → Electron desktop
- `globalThis.__PearMobileBridge` present → React Native mobile
- Neither → web browser (in-memory mock for development)

## Features

- **Marketplace** — Browse, create, and search peer-to-peer listings across categories.
- **Events** — Discover and create events; view details, locations, and attendee counts.
- **Calendar** — Month view with day selection; the next 5 upcoming events are listed below the calendar with date badges, times, locations, and attendee counts (with a people icon).
- **Contacts** — Manage contacts with notes and per-contact detail views.
- **Tasks** — Track tasks with notes and completion state.
- **Notes** — Create and search personal notes.
- **Messages** — Peer-to-peer chat with conversation list and chat view.
- **Activity Feed** — Recent interactions across listings and events.
- **Mobile** — Bottom tab bar and account sheet tailored for small screens.

## Development

```bash
npm run dev    # Vite dev server (browser, mock data)
npm run build  # Production build
npm start      # Electron desktop app
```

## P2P Networking

All peers join a shared Hyperswarm topic (`pearmarket-v1`) and replicate a common
Hypercore append-only log of listings. Listings are JSON entries with title, description,
price, category, image, and seller peer ID. Deletion is handled via tombstone appends.

## OTA Updates

Desktop: Pear runtime handles OTA updates via the updater drive, replicated over
Hyperswarm. The renderer receives `updating`/`updated` events and can trigger
`applyUpdate`.

Mobile: Same Pear updater, but the worklet must be suspended/resumed with app
lifecycle events via `Worklet.suspend()` / `Worklet.resume()`.
