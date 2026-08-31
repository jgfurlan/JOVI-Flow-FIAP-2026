# Architecture: Systemic Boundaries & Invariants

## Tech Stack Lock-in
- **Language:** HTML5, CSS3, Vanilla JavaScript (ES6 modules).
- **Styling:** **Tailwind CSS v4** (hybrid). `src/poc/css/input.css` is the source
  (`@import "tailwindcss"` + `@theme` tokens + `@layer components` for signature effects);
  `src/poc/css/jovi.css` is the **generated, committed, shipped** stylesheet — rebuild with
  `npm run css` (pinned `@tailwindcss/cli@4.3.3`). Bootstrap was removed (JOVI-108).
- **Database:** IndexedDB (stored locally under DB name `JOVIFlowDB`).
- **Communication:** Local device browser APIs (getUserMedia, Clipboard, Vibration).

## Deliverable Constraints (Sprint 2)
- Delivery is **one self-contained ZIP** of `src/poc/`; graded possibly offline; **no external
  links / CDNs** count. Every asset (CSS, fonts, JS) is vendored under `src/poc/`.
- Zero network requests to non-`file:`/`localhost` origins. The Tailwind CLI is a dev-time
  compiler; only plain compiled CSS ships.
- Fonts: Poppins self-hosted at `src/poc/assets/fonts/` (SIL OFL, licence shipped).
- Total transferred budget **< 150 KB**.

## Offline-First Architecture
All captures are stored in local browser storage (IndexedDB) as base64 data to allow offline availability.
1. **Viewfinder Feed:** Direct media stream from back camera.
2. **Local Canvas Processing:** Live Aura Light overlay applies radial colors to viewfinder pixels. A canvas context parses the snapshot to compute Laplacian contrast sharpness.
3. **Database Store:** Saves the payload directly into the `jovi-flow-media` store.

## Systemic Invariants (Do Not Break)
- **Local Sandbox:** No external HTTP servers or databases are required for data persistence. Everything operates inside the client browser sandbox.
- **View Transitions:** Screen transitions use the native browser View Transitions API for maximum performance.
- **No Heavy Frameworks:** Do NOT introduce React, Angular, or bundlers like Webpack/Vite unless explicitly requested. Keep the MVP light and fast. (The Tailwind CLI is a single-file CSS compiler, not a bundler — allowed.)
- **Generated CSS:** Never hand-edit `src/poc/css/jovi.css`. Edit `input.css` and run `npm run css`.

## Verification Loops (QA)
- **Baseline Viewport:** Must render perfectly on mobile screens (simulate 360px width in browser).
- **HTTP Requirement:** Camera access requires an HTTP server (localhost or HTTPS). Warn the user if loaded via `file://`.
- **Validation check:** Verify that IndexedDB can write, read, and delete media items without errors.
