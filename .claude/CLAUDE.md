# Claude.md

## About this application

This application is a customizable and [TEI (Text Encoding Initiative) Guideline](https://tei-c.org/release/doc/tei-p5-doc/en/html/index.html) compliant platform for hosting annotated digital editions and translations of works in the _Corpus Platonicum_. It is built in TypeScript using the [Astro](https://astro.build/) framework.

The application contains functionality to format and display TEI schema compliant Greek and English (extensible to other languages) Platonic texts side-by-side. Texts are searchable and navigable by Stephanus pages.

The application also supports a first-read mode, a new-reader focused translation and set of comments, which (in future iterations) will support multimedia views of the text.

All state relevant to the look, arrangement, and location of the texts is store in the URL for maximal sharability and ease of scholarly reference.

Additionally, the application aims to incorporate functionality to support comments in both Greek and English translations. The application will support an arbitrary number of comments stored and retrieved using Astro (the application's framework) content collections API. The comments are then dynamically inserted as TEI `<note>` elements in the rendered and displayed in the relevant TEI document.

## Context

On initialization, read the README.md and ARCHITECTURE.md to get a sense of the overall structure and design principles of the application. Design and implement plans to conform to these design principles.

## Project organization principles

### Components

`src/components/` is **not flat**. Components with local dependencies (TypeScript logic files, component-scoped CSS) live in their own subdirectory named after the component, e.g. `src/components/Header/`. Simple components with no local dependencies (e.g. `RadioToggle.astro`, `Footer.astro`, `head.astro`) may remain flat.

### Styles

`src/styles/` contains **global styles only**: design tokens (`variables.css`), resets, fonts, typography, annotations. Do not add component-scoped or page-scoped CSS here.

- Component-scoped CSS lives in the component's subdirectory alongside the component files
- Page-scoped CSS lives alongside the page in `src/pages/`, prefixed with `_` to suppress Astro's route warning (e.g. `src/pages/dialogue/_dialogue-page.css`)

## TEI Schema version

<https://epidoc.stoa.org/schema/9.7/tei-epidoc.rng>

## Github PRs and Issues

All PRs and issues (including subissues) should be created in my fork of the openplatodotorg repo.

After a PR is merged, check the recent commits to main and, if necessary, update the README.md and/or ARCHITECTURE.md files
