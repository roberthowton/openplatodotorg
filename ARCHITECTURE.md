# Architecture

Deep reference for the Open Plato platform. See [README.md](./README.md) for overview.

---

## Component Hierarchy

```
layouts/page-layout.astro         # Root HTML shell, imports global CSS
  components/head.astro           # <head>: ClientRouter, theme flash prevention
  components/Header.astro         # Mode toggle, lang toggle, search, theme button
  components/page-select.astro    # Stephanus page navigation
  main > .dialogueContainer
    components/Tei.astro          # (×1–2) Greek and/or English TEI columns
      TeiCustomElement.ts         # Web component: tei-container (applies behaviors)
    .text-column-first-read       # First-read column (shares Tei.astro, en.xml)
  components/CommentsPanel.astro  # Fixed sidebar (desktop) / bottom sheet (mobile)
  components/Footer.astro
```

---

## State Management (`src/state/url/`)

All UI state lives in the URL. The state machine follows a Redux-like pattern.

### Shape

```ts
interface UrlState {
  ref:     string | null;       // Stephanus scroll target (e.g. "103a1")
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

1. Import raw XML: `await import('../content/dialogue/alcibiades/gr.xml?raw')`
2. `processTei(xml)` (adapted from [astro-tei](https://github.com/raffazizzi/astro-tei)):
   - Parse with JSDOM (`contentType: "text/xml"`)
   - `ceteicean.preprocess()` converts `<tei-*>` elements
   - Serialize back to HTML string
3. Pass `{ dom, serialized, elements }` to `Tei.astro` as props
4. `Tei.astro` renders the serialized HTML via `set:html`

### Client (web component)

`TeiCustomElement.ts` registers `<tei-container>` as a custom element. On connect:

1. `applyBehaviors()` — installs custom element behaviors from `utils/behaviors/`
2. `injectAnchors()` — creates `<span data-ref="103a1">` anchor elements after line breaks
3. `annotate()` — wraps targeted text in `.annotated` spans
4. Re-runs on `astro:after-swap` (view transitions)

### Custom behaviors (`src/utils/behaviors/`)

| Behavior              | Element        | Role |
|-----------------------|----------------|------|
| `handle-line-begin`   | `tei-lb`       | Grid layout (line text + Stephanus marker); adaptive inline/block mode |
| `handle-milestone`    | `tei-milestone`| Stephanus page markers |
| `handle-div`          | `tei-div`      | Section structure |
| `handle-head`         | `tei-head`     | Heading typography |
| `handle-label`        | `tei-label`    | Speaker labels |
| `handle-tei-header`   | `tei-teiheader`| Hides TEI metadata header from display |

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
