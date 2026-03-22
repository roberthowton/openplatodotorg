# Open Plato Digital Edition Platform

A TEI (Text Encoding Initiative) compliant platform for hosting annotated digital editions of works in the _Corpus Platonicum_. Displays Greek and English texts side-by-side, navigable by Stephanus page references, with a scholarly annotation system. All UI state lives in the URL for sharability and citation.

## Guiding Principles

1. **URL-first state**: Every view shareable as a scholarly citation
2. **TEI compliance**: EpiDoc 9.7 schema, preserving source encoding
3. **Extensibility**: Content collections allow arbitrary comment sets
4. **First-read mode**: Simplified view for new readers (`?show=firstRead`)
5. **Minimal JS**: Server-render TEI, client enhances with behaviors

## Stack

- **Astro 5.x** (SSR via Vercel, View Transitions via `ClientRouter`)
- **CETEIcean 1.9.5** for TEI→HTML transformation
- **TypeScript**, **JSDOM** for server-side DOM manipulation
- **Vitest** for unit testing

## Directory Structure

```text
src/
├── content/
│   ├── dialogue/     # TEI XML files (gr.xml, en.xml, meta.json per dialogue)
│   ├── comment/      # Markdown annotations with YAML frontmatter
│   └── config.ts     # Astro content collections schema
├── pages/dialogue/[...dialogueId]/  # Dynamic dialogue routes
├── layouts/
│   └── page-layout.astro     # Root HTML shell (imports global styles)
├── components/
│   ├── head.astro            # <head> with ClientRouter + theme flash prevention
│   ├── Header.astro          # Mode toggle, lang toggle, search, theme
│   ├── Tei.astro             # TEI rendering wrapper
│   ├── TeiCustomElement.ts   # Web component: tei-container
│   ├── CommentsPanel.astro   # Side panel / mobile bottom sheet
│   ├── page-select.astro     # Stephanus navigation (SSR)
│   ├── page-select-client.ts # Page-select client logic
│   ├── show-button.astro     # Language show/hide toggle button
│   ├── show-button-client.ts # Show-button client logic
│   └── Footer.astro          # Site footer
├── state/url/                # Redux-like URL state machine
│   ├── types.ts              # UrlState, UrlAction, HARD_NAV_ACTIONS
│   ├── selectors.ts          # parseUrlState(), getUrlState()
│   ├── reducer.ts            # urlReducer() — pure state transitions
│   ├── actions.ts            # buildUrl(), buildUrlFromState()
│   └── dispatch.ts           # dispatch() — hard vs soft navigation
├── utils/
│   ├── processTei.ts         # CETEIcean preprocessing (server)
│   ├── loadComments.ts       # Comment collection loading
│   ├── sanitize.ts           # XSS prevention for comment HTML
│   └── behaviors/            # Custom TEI element handlers
├── scripts/
│   ├── injectAnchors.ts      # Anchor creation for comment targets
│   ├── annotate.ts           # Segment decomposition for highlighting
│   └── commentsPanel.ts      # Panel interaction logic
├── styles/
│   ├── variables.css         # Design tokens (colors, fonts, spacing)
│   ├── reset.css             # CSS reset
│   ├── typography.css        # Body typography
│   ├── fonts.css             # Font-face declarations
│   └── annotations.css       # Annotation highlight styles
├── consts/                   # Shared constants
└── assets/                   # Static assets (icons, XML fragments)
```

## Data Flow

1. **Server**: Load `meta.json` (`DialogueConfig`) + TEI XML → `processTei(xml, language, config)` → behaviors applied → HTML string
2. **Server**: Load comments via content collections → JSON in script tags
3. **Client**: `<tei-container>` custom element runs annotation pipeline
4. **Client**: `injectAnchors()` creates anchor spans after line breaks
5. **Client**: `annotate()` wraps targeted text with `.annotated` spans
6. **Client**: Panel shows comments on click, URL updated

## Key Systems

### State Management

URL is the single source of truth for all UI state. A Redux-like state machine (`src/state/url/`) parses, reduces, and serializes state to/from URL params. See [ARCHITECTURE.md](./ARCHITECTURE.md) for full detail.

### First-Read Mode

`?show=firstRead` renders a single-column translation with first-read-only comments, spacious typography, and a simplified header. Toggled via the FIRST READ / SCHOLARLY buttons.

### Dark Mode

`data-theme="dark"` on `<html>` activates CSS token overrides defined in `variables.css`. Persisted in `localStorage`; flash prevented by an inline script in `head.astro`.

### TEI Processing

CETEIcean converts TEI XML to `tei-*` custom elements in a preprocessing approach adapted from [astro-tei](https://github.com/raffazizzi/astro-tei). Behaviors are applied **server-side** via language- and dialogue-aware factories (`createBehaviors(language, config)`). Each dialogue provides a `meta.json` with `teiTitle` and `firstLineStephanusReference`. Behaviors handle:

- `tei-lb`: Grid layout for text + Stephanus line numbers
- `tei-milestone`: Stephanus page markers
- `tei-div`, `tei-head`, `tei-label`: Typography
- `tei-teiheader`: Metadata hiding, dramatis personae rendering

### Annotation Pipeline

Comments target text via YAML frontmatter:

```yaml
targets:
  - stephanus: "103a1" # Single reference
  - stephanusRange: { start, end } # Range
  - match: "lovers" # Text match for precision
```

Segment decomposition handles overlapping annotations by collecting boundary points and wrapping at each.

### URL State

```url
/dialogue/alcibiades?show=gr&show=en&ref=103a1&comment=en:103a1-lovers
```

- `show`: Languages/modes (gr, en, firstRead)
- `ref`: Stephanus scroll target
- `comment`: Active annotation IDs

### Stephanus Navigation

Format: `103a1` = page 103, column a, line 1. Page-select supports:

- Dropdown of all references
- Text search with debounced matching
- URL-based deep linking

## Development

```bash
pnpm install
pnpm dev         # Start dev server
pnpm build       # Type check + build
pnpm test        # Run Vitest tests
```

## Architecture

For component hierarchy, state machine internals, TEI pipeline detail, annotation algorithm, responsive strategy, and design system, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## TEI Schema

Uses [EpiDoc 9.7](https://epidoc.stoa.org/schema/9.7/tei-epidoc.rng).
