# Architecture

Deep reference for the Open Plato platform. See [README.md](./README.md) for overview.

---

## Component Hierarchy

```
layouts/page-layout.astro               # Root HTML shell, imports global CSS
  components/head.astro                 # <head>: ClientRouter, theme flash prevention
  components/Header/Header.astro        # Mode toggle, lang toggle, theme button
    Header/HeaderElement.ts             # Web component: site-header
  components/RadioToggle.astro          # Reusable radio/pill toggle (no TS dep)
  main > .dialogueContainer
    components/Tei/Tei.astro            # (×1–2) Greek and/or English TEI columns
      Tei/TeiCustomElement.ts           # Web component: tei-container
      Tei/tei-style.astro               # TEI stylesheet component
      Tei/tei-base-style.astro          # TEI base stylesheet component
    .text-column-first-read             # First-read column (shares Tei.astro, en.xml)
  components/PageSelect/PageSelect.astro  # Stephanus page navigation + text search
    PageSelect/page-select-client.ts    # Extracted search helpers (testable)
    PageSelect/highlight.css            # .highlight style (component-scoped global)
  components/CommentsPanel/CommentsPanel.astro  # Fixed sidebar / bottom sheet
    CommentsPanel/CommentsPanelElement.ts        # Web component: comments-panel
  components/Footer.astro
```

---

## State Management (`src/state/url/`)

All UI state lives in the URL. The state machine follows a Redux-like pattern.

### Shape

```ts
interface UrlState {
  ref:     string | null;       // Line reference scroll target (e.g. "103a1"); opaque string matching lb@n
  show:    ShowState[];         // Active columns: "gr" | "en" | "firstRead"
  comment: string[];            // Active comment IDs (comma-separated in URL)
  panel:   "pinned" | null;     // Panel pin state
}
```

### URL parameter reference

| Param     | Values                      | Example                        |
|-----------|-----------------------------|--------------------------------|
| `show`    | `gr`, `en`, `firstRead`     | `?show=gr&show=en`             |
| `ref`     | Stephanus ref string        | `?ref=103a1`                   |
| `comment` | Comma-separated IDs         | `?comment=en:103a1-lovers`     |
| `panel`   | `pinned` or absent          | `?panel=pinned`                |

### Files

| File           | Role |
|----------------|------|
| `types.ts`     | `UrlState`, `UrlAction` union, `HARD_NAV_ACTIONS` list |
| `selectors.ts` | `parseUrlState(url)` — SSR + client; `getUrlState()` — client only |
| `reducer.ts`   | `urlReducer(state, action)` — pure function, no side effects |
| `actions.ts`   | `buildUrl(baseUrl, state)` — serializes state to URL |
| `dispatch.ts`  | `dispatch(action)` — hard or soft nav; `dispatchAll(actions[])` |

### Hard vs. soft navigation

```
SET_SHOW / TOGGLE_SHOW / SET_FIRST_READ / EXIT_FIRST_READ
  → navigate(newUrl)          # Astro view transition (full re-render)

SET_COMMENT / ADD_COMMENT / CLEAR_COMMENT / PIN_PANEL / UNPIN_PANEL / TOGGLE_PIN / SET_REF
  → replaceState({}, "", url) # URL update only, no re-render
```

Hard nav is required when the set of displayed columns changes (server must render different TEI trees). Soft nav suffices for panel and comment state, which is managed entirely client-side.

### SSR compatibility

`parseUrlState(url: URL)` accepts any `URL` object and is called identically on the server (`Astro.url`) and client (`new URL(window.location.href)`).

---

## TEI Processing Pipeline

### Server (Astro SSR)

1. Load `meta.json` per dialogue — provides `DialogueConfig` (`teiTitle`, `firstLineReference`)
2. Import raw XML: `await import('../content/dialogue/alcibiades/gr.xml?raw')`
3. `processTei(xml, language, config)` (adapted from [astro-tei](https://github.com/raffazizzi/astro-tei)):
   - Parse XML with JSDOM (`contentType: "text/xml"`)
   - `resolveScheme(xmlDoc, meta)` infers the reference scheme from the document (see Reference Schemes below)
   - Create a separate HTML JSDOM as CETEIcean's `documentObject` so elements have `.style`
   - `ceteicean.preprocess()` converts `<TEI>` elements to `<tei-*>` custom elements
   - `createBehaviors(language, config)` produces language- and dialogue-aware handlers
   - `ceteicean.fallback()` applies behaviors server-side (bypasses `customElements.define()`)
   - Serialize to HTML string
4. Pass `{ dom, serialized, elements }` to `Tei.astro` as props
5. `Tei.astro` renders the serialized HTML via `set:html` — behaviors already applied

### Client (web component)

`TeiCustomElement.ts` registers `<tei-container>` as a custom element. Behaviors are **not** re-applied client-side. On connect:

1. `injectAnchors()` — creates `<span data-ref="103a1">` anchor elements after line breaks
2. `annotate()` — wraps targeted text in `.annotated` spans
3. Re-runs on `astro:after-swap` (view transitions)

Annotations remain client-side because they read from `<script type="application/json">` tags in the page and are intended to become dynamic (rebuilt on comment changes without a server round-trip).

### Custom behaviors (`src/utils/behaviors/`)

All behaviors are applied server-side during `processTei()`. Factories take `(language, config)` and return an element handler; simple handlers are plain functions.

| Behavior                | Element              | Role |
|-------------------------|----------------------|------|
| `handle-line-begin`     | `tei-lb`             | Grid layout (line text + scheme-driven markers); `data-speaker` from enclosing `tei-said[@who]`; adaptive inline/block mode |
| `handle-head`           | `tei-head`           | Heading typography; language-specific title from `config.teiTitle` |
| `handle-tei-header`     | `tei-teiheader`      | Hides TEI metadata; renders dramatis personae with `data-speaker-id` from `person[@xml:id]`; hides EN-only metadata |
| `handle-named-entity`   | `tei-persname`, `tei-placename` | Replaces with `<a>` (when `@key`/`@ref` resolves to an authority URL) or `<span>`; supported vocabs: `tgn`, `pleiades`, `wikidata` |

### Reference schemes (`src/utils/referenceSchemes/`)

The citation scheme used by a document is **pluggable**. `resolveScheme(xmlDoc, meta)` selects it:

1. Infer from XML: `milestone[@resp="Stephanus"]` present → `stephanus`
2. Explicit `meta.json` `referenceScheme` field
3. `opaque` fallback (refs treated as opaque anchor keys; no margin markers; never crashes)

The `ReferenceScheme` interface exposes `parse`, `inlineMarker`, `blockMarker`, `showsBlockMarker`, and `startingPageLabel`. Adding a new scheme means implementing the interface and adding it to the registry in `referenceSchemes/index.ts` — no changes to the handlers.

### Speaker identity

`person[@xml:id]` in `<particDesc>` is the authority for speaker identity:
- `handle-tei-header` sets `data-speaker-id` on each dramatis-personae person div
- `handle-line-begin` reads `who` from the nearest `tei-said` ancestor and sets `data-speaker` on each `tei-lb` line element (leading `#` stripped)
- Both attributes are available for CSS targeting and future client-side speaker highlighting

### Dialogue config (`src/content/dialogue/<id>/meta.json`)

Each dialogue provides a `meta.json` with required fields consumed by `processTei`:

```json
{
  "subtitle": "...",
  "teiTitle": { "gr": "ΑΛΚΙΒΙΑΔΗΣ", "en": "Alcibiades 1" },
  "firstLineReference": "103a1"
}
```

`firstLineStephanusReference` is accepted as a deprecated alias for `firstLineReference`. The `DialogueConfig` type (including the resolved `referenceScheme`) is defined in `src/types.ts`.

---

## Annotation System

### Comment frontmatter targeting

```yaml
targets:
  - stephanus: "103a1"                        # Single line anchor
  - stephanusRange: { start: "103a1", end: "104b2" }  # Range
  - match: "lovers"                            # Proximity text match
```

### Segment decomposition algorithm (`annotate.ts`)

Handles overlapping annotations without nested spans:

1. **Collect boundaries** — for each comment target, resolve start/end `{ node, offset }` pairs
2. **Sort** by document order (ends before starts at same position)
3. **Sweep** through boundaries, maintaining `activeNotes: Set<string>`
4. Between each pair of adjacent boundaries, wrap the text segment with a single `.annotated` span carrying all active note IDs as `data-note-ids`

### Proximity-based text matching

When a target has `match: "text"`:
- Walk all text nodes in `tei-container`
- For each occurrence, compute vertical distance from the anchor element
- Return the closest match (distance < 30px = same line → immediate return)
- Search capped at 2000 nodes

### Panel states

| State       | CSS class        | Behavior |
|-------------|------------------|----------|
| Collapsed   | `.collapsed`     | Translated off-screen; vertical tab visible |
| Open/overlay| (neither)        | Full panel visible, drops shadow over content |
| Pinned      | `.pinned`        | Panel open, `body.comments-panel-pinned` pushes `dialogueContainer` right by 340px |

Panel state is stored in `?panel=pinned` so it survives navigation.

### XSS prevention

Comment bodies (Markdown-rendered HTML) pass through `sanitize.ts` before being injected into the panel DOM.

---

## First-Read Mode

Activated by `?show=firstRead` (mutually exclusive with `gr`/`en`).

- **Server**: `loadComments(dialogueId, "en", firstRead=true)` filters to `firstRead: true` comments only
- **Layout**: Single `.text-column-first-read` column, `max-width: 65ch`, `font-size: 1.125rem`, `line-height: 1.8`
- **Header**: FIRST READ button active; SCHOLARLY button triggers `EXIT_FIRST_READ` → `?show=gr&show=en`
- **Mobile**: Font size reduces to `1rem`, `line-height: 1.7`

Default route (`/dialogue/alcibiades` with no `show` params) renders both Greek and English columns server-side (bypasses `parseUrlState` default of `firstRead`).

---

## Dark Mode

- Token file: `src/styles/variables.css`
  - Light defaults on `:root`
  - Dark overrides on `[data-theme="dark"]`
- Activation: `document.documentElement.dataset.theme = "dark"`
- Persistence: `localStorage.setItem("theme", "dark")`
- Flash prevention: inline `<script is:inline>` in `head.astro` runs before paint:
  ```js
  document.documentElement.dataset.theme = localStorage.getItem("theme") || "light";
  ```

---

## Responsive / Mobile Strategy

### Breakpoints

| Name    | Range                                  |
|---------|----------------------------------------|
| Mobile  | `max-width: 768px`                     |
| Tablet portrait | `769px–1024px, orientation: portrait` |
| Tablet landscape | `769px–1024px, orientation: landscape` |
| Desktop | `> 1024px`                             |

### Per-breakpoint behavior

**Mobile (≤768px)**
- `.dialogueContainer` switches from CSS Grid to `display: block` (stacked columns)
- Language toggle appears in header (hidden on desktop)
- Logo text hidden; search button hidden; theme label hidden
- Comments panel becomes a bottom sheet (`height: 50vh`, slides up from bottom, rounded top corners)
- Pin button hidden (overlay-only on mobile)

**Tablet portrait**
- Two-column grid (`1fr 1fr`)
- Comments panel overlays (no pin); pin button hidden
- Logo text smaller

**Tablet landscape**
- Matches desktop grid layout (`fit-content(45%) fit-content(55%)`)

**Desktop (>1024px)**
- Grid columns sized to content
- Comments panel can be pinned (pushes content left)

### Adaptive line markers

`checkOverflow()` (inline `<script>` in the dialogue page) detects text wrapping by comparing element `offsetHeight` to computed `lineHeight`. If wrapping is detected, `.inline-mode` is added to `.text-column`, switching Stephanus markers from grid-column to inline display. Runs on `load`, `resize`, and via `MutationObserver`.

---

## Design System (`src/styles/variables.css`)

No CSS framework. All tokens are CSS custom properties.

### Fonts

| Variable        | Font                   | Use |
|-----------------|------------------------|-----|
| `--font-display`| Barlow Semi Condensed  | Headers, labels, buttons |
| `--font-serif`  | EB Garamond            | Logo, decorative text |
| `--font-body`   | Source Serif 4         | Commentary, prose |
| `--font-greek`  | Porson / GFS Porson    | Greek TEI text |

### Semantic color tokens

| Token              | Light                | Dark             |
|--------------------|----------------------|------------------|
| `--color-bg`       | `#ffffff`            | `#1a1a1a`        |
| `--color-bg-alt`   | `#e8e8e0`            | `#2d2d2d`        |
| `--color-text`     | `#000000`            | `#e8e8e0`        |
| `--color-text-muted`| `#9a9a8a`           | `#9a9a8a`        |
| `--color-border`   | `#c4c4b4`            | `#4a4a3a`        |
| `--color-accent`   | `#e8c547` (yellow)   | (unchanged)      |

Component styles are scoped via Astro `<style>` blocks (converted to CSS modules at build time).

### Style file organization

- `src/styles/` — **global styles only**: design tokens, resets, fonts, typography, annotations
- Component-scoped CSS (e.g. `.highlight`) lives alongside its component in the component's subdirectory
- Page-scoped CSS lives alongside its page in `src/pages/` (prefixed `_` to suppress Astro's route warning, e.g. `_dialogue-page.css`)

---

## Key Design Patterns

### Web Components

`tei-container` and `show-button` are native Custom Elements (`customElements.define`). They self-initialize in `connectedCallback` and re-initialize after view transitions via `astro:after-swap`.

### Island pattern

Components are server-rendered Astro components with client-side `<script>` blocks that self-initialize on DOM ready. No framework hydration overhead.

### View Transitions

`ClientRouter` (Astro's View Transitions router) intercepts link clicks and dispatches `astro:after-swap` after the new page's DOM is swapped in. All client scripts re-run `init*()` functions on this event to re-attach listeners and re-apply behaviors.

### SSR on Vercel

The app is SSR (not SSG). Each request re-renders the dialogue page with the URL's `show`/`ref`/`comment`/`panel` params, so all state is encoded in the URL and pages are always shareable as-is.
