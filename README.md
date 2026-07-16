# Handbook — user guide template & builder

A long-form documentation page (sidebar ToC, full-text search, full-viewport
hero) plus a no-code notebook-style editor that writes it for you. **No
dependencies, no build step** — plain HTML/CSS/JS you can host on any
internal web server (or just open the file in a browser).

Split out from the [Deck presentation framework](../html-presentation-template)
so the user-guide tooling can version and ship independently of the slide-deck
demos.

## Quick start

- **Hand-write a guide** — copy `template-handbook.html`, rename it, edit the
  `<div class="hb-content">` section with your own headings, paragraphs,
  images and callouts. See [ELEMENTS.md-equivalent details below](#content-types).
- **No-code authoring** — open `builder/` (served over HTTP so exports embed
  `themes/handbook.css` and `handbook.js` automatically; see
  `builder/README.md`).

### Handbook — `themes/handbook.css`

Not a deck — a long-form **user guide / reference manual** page.

- **Sidebar ToC, built for you** — every `h2` (chapter) and `h3` (subsection)
  in `.hb-content` appears in the left sidebar automatically, gets a linkable
  id from its text, and the section you're reading is highlighted as you
  scroll.
- **Search** — press `/` (or `Ctrl/Cmd+K`) and type: matches highlight in the
  page, `Enter` jumps to the next one, `Shift+Enter` to the previous, `Esc`
  clears.
- **`T` shows/hides the ToC.** On narrow screens it starts hidden and
  overlays; the ☰ button does the same by mouse.
- **Hero** — `hb-hero` fills the full viewport, so opening the page shows
  just the hero and the ToC. Inside: an `eyebrow`, `h1`, `lead` paragraph,
  `hb-meta` line, and `hb-hero-art` for an image (a placeholder shows until
  you drop an `<img>` in). On small screens an animated `hb-scrollhint`
  points past the fold.
- **Content types** — plain HTML `<table>` renders styled (wrap wide ones in
  `hb-table-scroll`); images and `<figure>`/`<figcaption>` are styled;
  `hb-video` keeps a `<video>` or embed `<iframe>` at 16:9 inside the column;
  `hb-screen` is the mock-window screenshot frame; `hb-callout` with
  `tip`/`note`/`warn`/`ok`, plus `ui` and `<kbd>`.

### Handbook Builder — `builder/` (write guides without HTML)

A notebook-style editor (think Colab/Jupyter cells) that generates Handbook
pages. Open it in a browser — nothing to install.

- **Cells** — add text, image, video or code cells; reorder with ↑/↓, insert
  below any cell, delete. Text cells are rich-text: a formatting toolbar
  (paragraph, headings H1–H5, bold/italic/underline, bullet and numbered
  lists, links, clear formatting) appears on the cell you're editing. H1–H2
  become ToC chapters, H3 becomes a subsection (cell H1s are demoted to `h2`
  on export, since the hero owns the page's `h1`).
- **Draft ToC** — a live table of contents in the left sidebar, built from
  your headings as you type; click an entry to jump to its cell.
- **Media** — images and videos can be uploaded (embedded as data URIs, so
  the exported guide is one self-contained file) or referenced by URL.
  Non-file video URLs become `<iframe>` embeds. Images have a width picker
  (full / ½ / ⅓ / ¼ / ⅕ of the column; always full width on small screens).
- **Code cells** — a monospace editor with a language picker (Python,
  JavaScript/TS, SQL, Bash, PowerShell, JSON, YAML, HTML, CSS, Java, C#, or
  plain text). Syntax highlighting is baked into the HTML at export time by a
  built-in tokenizer — exported guides need no highlighting JavaScript and no
  external libraries.
- **Guide details** — title, lead, app name, version, owner, updated date and
  hero image feed the hero and the sidebar brand.
- **Autosave** — the draft persists in the browser's localStorage as you
  type. "Start over" clears it.
- **Save draft / Open…** — save the draft as a portable `.json`, reopen it
  later anywhere. Exported guides embed their own draft, so an already
  downloaded guide `.html` can be reopened in the builder and edited too.
- **Preview / Download HTML** — preview opens the generated guide in a new
  tab; download produces `<app>-guide.html` with `themes/handbook.css` and
  `handbook.js` inlined (serve the builder over HTTP for inlining; opened as
  a bare file it falls back to relative links).

## Files

```
index.html              hub page linking the template and the builder
template-handbook.html  starter for hand-written guides (sidebar ToC + search)
handbook.js             guide engine: auto ToC, scrollspy, search, keyboard
themes/handbook.css     the Handbook page styling
builder/                notebook-style editor that exports Handbook guides
                         (open builder/ over HTTP; see builder/README.md)
```
