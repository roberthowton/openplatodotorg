# Claude.md

## About this application

This application is a customizable and [TEI (Text Encoding Initiative) Guideline](https://tei-c.org/release/doc/tei-p5-doc/en/html/index.html) compliant platform for hosting annotated digital editions and translations of works in the _Corpus Platonicum_. It is built in TypeScript using the [Astro](https://astro.build/) framework.

The application contains functionality to format and display TEI schema compliant Greek and English (extensible to other languages) Platonic texts side-by-side. Texts are searchable and navigable by Stephanus pages.

The application also supports a first-read mode, a new-reader focused translation and set of comments, which (in future iterations) will support multimedia views of the text.

All state relevant to the look, arrangement, and location of the texts is store in the URL for maximal sharability and ease of scholarly reference.

Additionally, the application aims to incorporate functionality to support comments in both Greek and English translations. The application will support an arbitrary number of comments stored and retrieved using Astro (the application's framework) content collections API. The comments are then dynamically inserted as TEI `<note>` elements in the rendered and displayed in the relevant TEI document.

## TEI Schema version

<https://epidoc.stoa.org/schema/9.7/tei-epidoc.rng>

## Github PRs and Issues

All PRs and issues (including subissues) should be created in my fork of the openplatodotorg repo.
