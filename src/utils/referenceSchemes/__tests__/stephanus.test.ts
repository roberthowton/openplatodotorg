import { describe, it, expect } from 'vitest';
import {
  stephanusScheme,
  parseStephanusReference,
  getStephanusLineMarker,
  isStephanusRef,
  LINE_NUMBERS_TO_DISPLAY,
  STEPHANUS_COLUMN_REGEX,
} from '../stephanus';

describe('parseStephanusReference', () => {
  it('parses standard reference', () => {
    expect(parseStephanusReference('103a1')).toEqual({ page: '103', column: 'a', line: '1' });
  });
  it('parses double-digit line', () => {
    expect(parseStephanusReference('104b10')).toEqual({ page: '104', column: 'b', line: '10' });
  });
  it('parses column e', () => {
    expect(parseStephanusReference('200e5')).toEqual({ page: '200', column: 'e', line: '5' });
  });
});

describe('isStephanusRef', () => {
  it('returns true for valid ref', () => expect(isStephanusRef('103a1')).toBe(true));
  it('returns false for opaque ref', () => expect(isStephanusRef('foo-bar')).toBe(false));
  it('returns false for empty string', () => expect(isStephanusRef('')).toBe(false));
});

describe('getStephanusLineMarker', () => {
  it('line 1 column a → page', () => expect(getStephanusLineMarker('103', 'a', '1')).toBe('103'));
  it('line 1 column b → column', () => expect(getStephanusLineMarker('103', 'b', '1')).toBe('b'));
  it('line 5 → line number', () => expect(getStephanusLineMarker('103', 'a', '5')).toBe('5'));
});

describe('stephanusScheme.parse', () => {
  it('returns parsed parts for valid ref', () => {
    expect(stephanusScheme.parse('103a1')).toEqual({ page: '103', column: 'a', line: '1' });
  });
  it('returns null for non-Stephanus ref', () => {
    expect(stephanusScheme.parse('foo-bar')).toBeNull();
  });
});

describe('stephanusScheme.inlineMarker', () => {
  it('page+column for line 1 col a', () => {
    const parsed = { page: '103', column: 'a', line: '1' };
    expect(stephanusScheme.inlineMarker(parsed, { ref: '103a1', isFirstLine: true })).toBe('103a');
  });
  it('column only for line 1 col b', () => {
    const parsed = { page: '103', column: 'b', line: '1' };
    expect(stephanusScheme.inlineMarker(parsed, { ref: '103b1', isFirstLine: false })).toBe('b');
  });
  it('line number otherwise', () => {
    const parsed = { page: '103', column: 'a', line: '5' };
    expect(stephanusScheme.inlineMarker(parsed, { ref: '103a5', isFirstLine: false })).toBe('5');
  });
});

describe('stephanusScheme.blockMarker', () => {
  it('column for first line of document', () => {
    const parsed = { page: '103', column: 'a', line: '1' };
    expect(stephanusScheme.blockMarker(parsed, { ref: '103a1', isFirstLine: true })).toBe('a');
  });
  it('page for line 1 col a non-first', () => {
    const parsed = { page: '104', column: 'a', line: '1' };
    expect(stephanusScheme.blockMarker(parsed, { ref: '104a1', isFirstLine: false })).toBe('104');
  });
  it('line number for line 5', () => {
    const parsed = { page: '103', column: 'a', line: '5' };
    expect(stephanusScheme.blockMarker(parsed, { ref: '103a5', isFirstLine: false })).toBe('5');
  });
});

describe('stephanusScheme.showsBlockMarker', () => {
  it('true for cadence lines', () => {
    LINE_NUMBERS_TO_DISPLAY.forEach((line) => {
      expect(stephanusScheme.showsBlockMarker({ page: '103', column: 'a', line })).toBe(true);
    });
  });
  it('false for non-cadence line', () => {
    expect(stephanusScheme.showsBlockMarker({ page: '103', column: 'a', line: '2' })).toBe(false);
  });
});

describe('stephanusScheme.startingPageLabel', () => {
  it('returns page from first ref', () => {
    expect(stephanusScheme.startingPageLabel?.('103a1')).toBe('103');
  });
});

describe('constants', () => {
  it('LINE_NUMBERS_TO_DISPLAY includes 1, 5, 10, 15', () => {
    expect(LINE_NUMBERS_TO_DISPLAY).toEqual(['1', '5', '10', '15']);
  });
  it('STEPHANUS_COLUMN_REGEX matches a-e', () => {
    expect(STEPHANUS_COLUMN_REGEX.test('103a1')).toBe(true);
    expect(STEPHANUS_COLUMN_REGEX.test('103f1')).toBe(false);
  });
});
