import { describe, it, expect } from 'vitest';
import processTei from '../processTei';

const sampleTeiXml = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title>Test Document</title>
      </titleStmt>
    </fileDesc>
  </teiHeader>
  <text>
    <body>
      <div>
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

  it('sets data-elements attribute on root', () => {
    const result = processTei(sampleTeiXml);
    const root = result.dom.documentElement;
    expect(root.hasAttribute('data-elements')).toBe(true);
  });

  it('elements array contains found element names', () => {
    const result = processTei(sampleTeiXml);
    expect(result.elements.length).toBeGreaterThan(0);
    // CETEIcean uses namespace:localname format
    expect(result.elements.some(el => el.includes('tei'))).toBe(true);
  });

  it('preserves content in serialized output', () => {
    const result = processTei(sampleTeiXml);
    expect(result.serialized).toContain('Test paragraph content');
  });
});
