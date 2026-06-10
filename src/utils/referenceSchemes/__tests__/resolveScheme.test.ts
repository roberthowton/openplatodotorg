import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { resolveScheme } from '../index';

const makeXml = (body: string) =>
  new JSDOM(
    `<?xml version="1.0"?><TEI xmlns="http://www.tei-c.org/ns/1.0"><text><body>${body}</body></text></TEI>`,
    { contentType: 'text/xml' },
  ).window.document;

const xmlWithMilestone = makeXml(
  '<milestone unit="page" resp="Stephanus" n="103"/><lb n="103a1"/>',
);
const xmlWithStephanusLb = makeXml('<lb n="103a1"/>');
const xmlOpaque = makeXml('<lb n="foo-bar"/>');
const xmlEmpty = makeXml('');

describe('resolveScheme', () => {
  it('infers stephanus from milestone[@resp="Stephanus"]', () => {
    expect(resolveScheme(xmlWithMilestone).id).toBe('stephanus');
  });

  it('infers stephanus from Stephanus-shaped lb@n', () => {
    expect(resolveScheme(xmlWithStephanusLb).id).toBe('stephanus');
  });

  it('falls back to opaque for unrecognised lb@n', () => {
    expect(resolveScheme(xmlOpaque).id).toBe('opaque');
  });

  it('falls back to opaque for empty document', () => {
    expect(resolveScheme(xmlEmpty).id).toBe('opaque');
  });

  it('respects explicit meta.referenceScheme override', () => {
    expect(resolveScheme(xmlOpaque, { referenceScheme: 'stephanus' }).id).toBe('stephanus');
  });

  it('uses opaque for unknown meta.referenceScheme', () => {
    expect(resolveScheme(xmlOpaque, { referenceScheme: 'unknown-scheme' }).id).toBe('opaque');
  });

  it('XML inference takes priority over meta', () => {
    // XML has Stephanus milestone; meta says opaque — XML wins
    expect(resolveScheme(xmlWithMilestone, { referenceScheme: 'opaque' }).id).toBe('stephanus');
  });
});
