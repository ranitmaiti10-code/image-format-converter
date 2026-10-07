# Image Converter MVP

A ready-to-run, client-side PNG ↔ JPEG converter.

## Features

- Drag-and-drop or file picker upload
- PNG → JPEG
- JPEG → PNG
- JPEG quality control (10–100%)
- Image preview
- Automatic output filename
- Browser-only conversion using Canvas API
- No server, dependencies, build step, or upload required
- JPEG conversion uses a white background for transparent PNG pixels

## Run

Open `index.html` in a modern browser.

## Files

- `index.html` — UI structure
- `styles.css` — styling and responsive layout
- `app.js` — upload, conversion, preview, and download logic

## Codex handoff

The app intentionally has no framework or dependencies, making it straightforward for Codex to modify. The main conversion entry point is `convertAndDownload()` in `app.js`.
