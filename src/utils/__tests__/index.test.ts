import { describe, it, expect } from 'vitest';
import {
  parseStephanusReference,
  getStephanusLineMarker,
  getLineNumbersFromTeiDom,
} from '../index';

describe('parseStephanusReference', () => {
  it('parses page, column, and line', () => {
    const result = parseStephanusReference('103a1');
    expect(result).toEqual({ page: '103', column: 'a', line: '1' });
  });

  it('parses different column letters', () => {
    expect(parseStephanusReference('104b5')).toEqual({ page: '104', column: 'b', line: '5' });
    expect(parseStephanusReference('105c10')).toEqual({ page: '105', column: 'c', line: '10' });
    expect(parseStephanusReference('106d15')).toEqual({ page: '106', column: 'd', line: '15' });
    expect(parseStephanusReference('107e1')).toEqual({ page: '107', column: 'e', line: '1' });
  });
});

describe('getStephanusLineMarker', () => {
  it('returns page for line 1 column a', () => {
    expect(getStephanusLineMarker('103', 'a', '1')).toBe('103');
  });

  it('returns column for line 1 non-a column', () => {
    expect(getStephanusLineMarker('103', 'b', '1')).toBe('b');
    expect(getStephanusLineMarker('103', 'c', '1')).toBe('c');
  });

  it('returns line number for non-1 lines', () => {
    expect(getStephanusLineMarker('103', 'a', '5')).toBe('5');
    expect(getStephanusLineMarker('103', 'b', '10')).toBe('10');
  });
});

describe('getLineNumbersFromTeiDom', () => {
  it('extracts n attributes from tei-lb elements', () => {
    document.body.innerHTML = `
      <tei-lb n="103a1"></tei-lb>
      <tei-lb n="103a2"></tei-lb>
      <tei-lb n="103a3"></tei-lb>
    `;
    const result = getLineNumbersFromTeiDom(document);
    expect(result).toEqual(['103a1', '103a2', '103a3']);
  });

  it('returns empty array when no tei-lb elements', () => {
    document.body.innerHTML = '<p>No line breaks</p>';
    const result = getLineNumbersFromTeiDom(document);
    expect(result).toEqual([]);
  });
});
