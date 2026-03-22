import { describe, it, expect } from 'vitest';
import processTei from '../processTei';

const sampleTeiXml = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title>Test Document</title>
        <sponsor>Perseus Project</sponsor>
        <principal>Gregory Crane</principal>
        <respStmt><resp>Prepared under the supervision of</resp></respStmt>
        <funder>Annenberg</funder>
      </titleStmt>
    </fileDesc>
    <profileDesc>
      <particDesc>
        <person><persName>Socrates</persName></person>
      </particDesc>
    </profileDesc>
  </teiHeader>
  <text>
    <body>
      <div>
        <head>Test Title</head>
        <p>Test paragraph content</p>
      </div>
    </body>
  </text>
</TEI>`;

describe('processTei', () => {
  it('returns dom, serialized, and elements', () => {
    const result = processTei(sampleTeiXml);
    expect(result).toHaveProperty('dom');
    expect(result).toHaveProperty('serialized');
    expect(result).toHaveProperty('elements');
  });

  it('serialized output contains tei- prefixed elements', () => {
    const result = processTei(sampleTeiXml);
    expect(result.serialized).toContain('tei-');
  });

  it('sets data-elements attribute on tei root element', () => {
    const result = processTei(sampleTeiXml);
    const teiRoot = result.dom.querySelector('[data-elements]');
    expect(teiRoot).not.toBeNull();
  });

  it('elements array contains found element names', () => {
    const result = processTei(sampleTeiXml);
    expect(result.elements.length).toBeGreaterThan(0);
    expect(result.elements.some(el => el.includes('tei'))).toBe(true);
  });

  it('preserves content in serialized output', () => {
    const result = processTei(sampleTeiXml);
    expect(result.serialized).toContain('Test paragraph content');
  });

  it('gr language: serialized output contains Greek title', () => {
    const result = processTei(sampleTeiXml, 'gr');
    expect(result.serialized).toContain('ΑΛΚΙΒΙΑΔΗΣ');
  });

  it('en language: serialized output contains English title', () => {
    const result = processTei(sampleTeiXml, 'en');
    expect(result.serialized).toContain('Alcibiades 1');
  });

  it('en language: sponsor element is hidden', () => {
    const result = processTei(sampleTeiXml, 'en');
    const sponsor = result.dom.querySelector('tei-sponsor');
    expect(sponsor?.getAttribute('style')).toContain('display: none');
  });

  it('en language: principal element is hidden', () => {
    const result = processTei(sampleTeiXml, 'en');
    const principal = result.dom.querySelector('tei-principal');
    expect(principal?.getAttribute('style')).toContain('display: none');
  });

  it('gr language: sponsor not hidden', () => {
    const result = processTei(sampleTeiXml, 'gr');
    const sponsor = result.dom.querySelector('tei-sponsor');
    expect(sponsor?.getAttribute('style') ?? '').not.toContain('display: none');
  });

  it('en language: tei-head contains English title h1', () => {
    const result = processTei(sampleTeiXml, 'en');
    const h1 = result.dom.querySelector('tei-head h1');
    expect(h1?.textContent).toBe('Alcibiades 1');
  });

  it('gr language: tei-head contains Greek title h1', () => {
    const result = processTei(sampleTeiXml, 'gr');
    const h1 = result.dom.querySelector('tei-head h1');
    expect(h1?.textContent).toBe('ΑΛΚΙΒΙΑΔΗΣ');
  });
});
