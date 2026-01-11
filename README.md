# Open Plato Digital Edition Platform

A TEI (Text Encoding Initiative) compliant platform for hosting annotated digital editions of works in the _Corpus Platonicum_. Displays Greek and English texts side-by-side, navigable by Stephanus page references, with a scholarly annotation system. All UI state lives in the URL for sharability and citation.

## Guiding Principles

1. **URL-first state**: Every view shareable as a scholarly citation
2. **TEI compliance**: EpiDoc 9.7 schema, preserving source encoding
3. **Extensibility**: Content collections allow arbitrary comment sets
4. **First-read mode**: [Planned] simplified view for new readers
5. **Minimal JS**: Server-render TEI, client enhances with behaviors

## Stack

- **Astro 5.x** (SSR via Vercel)
- **CETEIcean 1.9.5** for TEI→HTML transformation
- **TypeScript**, **JSDOM** for server-side DOM manipulation

## Directory Structure

```text
src/
├── content/
│   ├── dialogue/     # TEI XML files (gr.xml, en.xml per dialogue)
│   ├── comment/      # Markdown annotations with YAML frontmatter
│   └── config.ts     # Astro content collections schema
├── pages/dialogue/[...dialogueId]/  # Dynamic dialogue routes
├── components/
│   ├── Tei.astro             # TEI rendering wrapper
│   ├── TeiCustomElement.ts   # Client-side behavior application
│   ├── CommentsPanel.astro   # Side panel for annotations
│   └── page-select.astro     # Stephanus navigation
├── utils/
│   ├── processTei.ts         # CETEIcean preprocessing
│   ├── loadComments.ts       # Comment collection loading
│   └── behaviors/            # Custom TEI element handlers
├── scripts/
│   ├── injectAnchors.ts      # Anchor creation for comment targets
│   ├── annotate.ts           # Segment decomposition for highlighting
│   └── commentsPanel.ts      # Panel interaction logic
└── styles/                   # TEI styling, fonts (Porson for Greek)
```

## Data Flow

1. **Server**: Load TEI XML → `processTei()` (CETEIcean) → HTML string
2. **Server**: Load comments via content collections → JSON in script tags
3. **Client**: `<tei-container>` custom element applies behaviors
4. **Client**: `injectAnchors()` creates anchor spans after line breaks
5. **Client**: `annotate()` wraps targeted text with `.annotated` spans
6. **Client**: Panel shows comments on click, URL updated

## Key Systems

### TEI Processing

CETEIcean converts TEI XML to `tei-*` custom elements. Behaviors in `utils/behaviors/` handle:

- `tei-lb`: Grid layout for text + Stephanus line numbers
- `tei-milestone`: Stephanus page markers
- `tei-div`, `tei-head`, `tei-label`: Typography

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

## TEI Schema

Uses [EpiDoc 9.7](https://epidoc.stoa.org/schema/9.7/tei-epidoc.rng).
