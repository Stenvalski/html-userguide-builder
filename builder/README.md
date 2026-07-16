# Handbook Builder

A notebook-style editor (Colab/Jupyter-like cells) for writing user guides
without touching HTML. It generates a single self-contained `.html` file in
the Handbook template — sidebar ToC, full-text search, full-viewport hero —
ready to drop on the intranet.

## How to start it

Serve the **project root** (not this folder — the builder reads
`../themes/handbook.css` and `../handbook.js` when exporting):

```
cd ~/projects/html-userguide-builder
python3 -m http.server 8931
```

Then open **http://localhost:8931/builder/**

Double-clicking `index.html` also works, but browsers block local file reads,
so exports then *link* the framework files instead of embedding them — the
downloaded guide must sit next to `handbook.js` and `themes/` to look right.
Served over HTTP, exports are fully self-contained.

## Using it

- **Guide details** — title, lead, version, owner and hero image feed the
  hero section and the sidebar.
- **Cells** — add text, image, video or code cells; reorder with ↑/↓, insert
  below any cell, delete. The formatting toolbar (headings H1–H5, bold,
  lists, links…) appears on the text cell you're editing.
- **Draft ToC** — builds live from your headings in the left sidebar;
  H1–H2 = chapter, H3 = subsection. Click an entry to jump to its cell.
- **Images** — upload (embedded into the export) or link by URL; width
  picker from full down to ⅕ column.
- **Code cells** — language picker (Python, JS/TS, SQL, Bash, PowerShell,
  JSON, YAML, HTML, CSS, Java, C#); syntax highlighting is baked in at
  export time, no JavaScript in the output.
- **Autosave** — drafts persist in this browser (localStorage, tied to the
  URL origin — stick to one way of opening the builder). **Start over**
  clears the draft.
- **Save draft / Open…** — **Save draft** downloads the work as
  `<app>-draft.json`; **Open…** loads it back later (on any machine or
  browser). Exported guides also carry their draft inside the file, so
  **Open…** accepts a previously downloaded guide `.html` too — to add a
  section to a published guide, open the guide file itself, edit, and
  re-export. Opening asks before replacing unsaved work.
- **Preview** opens the generated guide in a new tab; **Download HTML**
  saves `<app>-guide.html`.
