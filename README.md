# Contagem EWM — SAP EWM Inventory Count App

A mobile-first, offline-capable web app for counting physical stock against SAP EWM storage bins and exporting the result as a file ready for upload back into EWM.

No backend, no build step, no framework — plain HTML/CSS/JS that runs entirely in the browser. All counted data is stored locally on the device (IndexedDB) until you export it.

## Features

- **Guided 4-step count flow** — position (bin/material/batch) → packaging unit 1 → packaging unit 2 → review, with a live progress stepper.
- **Barcode/QR scanning** via the device camera (`html5-qrcode`), with manual entry as a fallback.
- **Master data upload** — import Materials, Batches and Storage Bins from `.csv` or `.xlsx`, with automatic column-matching and a manual mapping screen.
- **Packaging breakdown** — pick a packaging type (e.g. Pallet, Box, Drum) per level and record how much of the material's UoM (e.g. `56 KG`) it contains.
- **Incomplete units** — record partial/mixed quantities separately from full units.
- **CSV / XLSX export** formatted for re-import into SAP EWM.
- **Multi-language UI** (Portuguese / English), fully driven by `config.json` — no code changes needed to edit copy or add a language.
- **Local backup/restore** — export/import all app data as a single `.json` file from the Setup screen.
- **Works offline** after first load; all state persists in the browser's IndexedDB and survives refreshes and app restarts.

## Tech stack

Vanilla HTML/CSS/JS. No package.json, no bundler, no framework. Third-party libraries are loaded from CDN in `index.html`:

- [SheetJS (xlsx)](https://cdnjs.com/libraries/xlsx) 0.18.5 — reading/writing `.xlsx`
- [PapaParse](https://cdnjs.com/libraries/PapaParse) 5.4.1 — reading `.csv`
- [html5-qrcode](https://cdnjs.com/libraries/html5-qrcode) 2.3.8 — camera barcode/QR scanning
- Google Fonts — Space Grotesk, Inter, IBM Plex Mono

## File structure

```
index.html            Markup for all screens (Count, List, Setup)
styles.css             All styling (design tokens in :root)
config.json             Default runtime config: languages, packaging types, UoM types
config.js               Loads config.json, i18n t() helper, applyTranslations()
state.js               Shared in-memory state object + small utilities
storage.js              IndexedDB persistence layer (save/restore/backup)
scanner.js               Step 1 (position) logic + camera scanner
count-flow.js            Steps 2–4 logic: packaging, UoM quantity, review, confirm
list-export.js            Counted-lines list screen + CSV/XLSX export
master-data.js           Master data (materials/batches/bins) upload & column mapping
packaging-config.js       Setup screen editor for the packaging-type list
uom-config.js             Setup screen editor for the UoM list
main.js                 App bootstrap: nav, screen switching, init()
```

There's no bundler, so **script order in `index.html` matters** — each file relies on globals defined by the ones before it:

```
config.js → state.js → storage.js → scanner.js → count-flow.js
→ list-export.js → master-data.js → packaging-config.js → uom-config.js → main.js
```

If you add a new file, add its `<script>` tag in the right place in that chain.

## Running locally

The app must be served over HTTP(S) — **do not** open `index.html` directly via `file://`. Two reasons:

1. The app scripts are referenced with root-absolute paths (`/config.js`, `/state.js`, …), which only resolve when served from a web root.
2. Camera access (`getUserMedia`, used for barcode scanning) requires a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) — HTTPS, or `http://localhost`.

Any static file server works:

```bash
# Option A — Node (no install needed)
npx serve .

# Option B — Python
python3 -m http.server 8000
```

Then open `http://localhost:<port>`. Camera scanning will work on `localhost`; on any other host you'll need HTTPS (see Cloudflare Pages below, which gives you that for free).

## Configuration

Runtime config — languages/translations, the list of packaging types, and the list of valid UoM values — lives in **`config.json`**, fetched at startup by `config.js`. Edit it directly to change copy or defaults; no rebuild required. (`config.js` also embeds the same object as `DEFAULT_CONFIG`, used only as a fallback if `config.json` fails to load — keep the two in sync if you edit one.)

End users can also edit the packaging-type and UoM lists from the in-app **Setup** screen; those overrides are saved to the browser's IndexedDB per device.

## Data & privacy

Everything — master data, counted lines, settings — is stored client-side in IndexedDB. Nothing is sent to a server; there is no backend. Use the **Setup → Backup** export/import to move data between devices or keep a copy before clearing browser data.

## Deploying

### 1. Push to GitHub

This folder is already a git repository with an initial commit on `main`. To publish it:

```bash
# create an empty repository on GitHub first (no README/license/gitignore), then:
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2. Host on Cloudflare Pages

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git**, and select this repository.
2. Build settings:
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`
3. Deploy. Cloudflare Pages serves the site from the repo root with HTTPS on `*.pages.dev` automatically — which satisfies the secure-context requirement for camera scanning out of the box.
4. Every push to `main` triggers an automatic redeploy. Add a custom domain under the Pages project's **Custom domains** tab if you want one (also HTTPS by default).

No environment variables, secrets, or build step are needed — it's a static site.
