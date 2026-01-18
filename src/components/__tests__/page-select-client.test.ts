import { describe, it, expect } from 'vitest';
import {
  extractReferenceFromId,
  createPreview,
  escapeRegex,
  highlightMatch,
  filterReferences,
} from '../page-select-client';

describe('extractReferenceFromId', () => {
  it('extracts reference from Greek text div ID', () => {
    expect(extractReferenceFromId('103a1-gr-text', 'gr')).toBe('103a1');
  });

  it('extracts reference from English text div ID', () => {
    expect(extractReferenceFromId('103a1-en-text', 'en')).toBe('103a1');
  });

  it('handles multi-digit line numbers', () => {
    expect(extractReferenceFromId('105b15-gr-text', 'gr')).toBe('105b15');
  });
});

describe('createPreview', () => {
  it('creates preview with context around match', () => {
    const text = 'This is a long text about Socrates and his philosophical teachings.';
    const matchIndex = text.indexOf('Socrates');
    const preview = createPreview(text, matchIndex, 'Socrates'.length);
    expect(preview).toContain('Socrates');
  });

  it('adds ellipsis when truncating start', () => {
    const text = 'A'.repeat(50) + 'Socrates' + 'B'.repeat(50);
    const matchIndex = 50;
    const preview = createPreview(text, matchIndex, 8);
    expect(preview.startsWith('...')).toBe(true);
  });

  it('adds ellipsis when truncating end', () => {
    const text = 'A'.repeat(10) + 'Socrates' + 'B'.repeat(50);
    const matchIndex = 10;
    const preview = createPreview(text, matchIndex, 8);
    expect(preview.endsWith('...')).toBe(true);
  });

  it('does not add ellipsis for short text', () => {
    const text = 'Short Socrates text';
    const matchIndex = text.indexOf('Socrates');
    const preview = createPreview(text, matchIndex, 8);
    expect(preview.startsWith('...')).toBe(false);
    expect(preview.endsWith('...')).toBe(false);
  });
});

describe('escapeRegex', () => {
  it('escapes dots', () => {
    expect(escapeRegex('hello.world')).toBe('hello\\.world');
  });

  it('escapes asterisks', () => {
    expect(escapeRegex('test*')).toBe('test\\*');
  });

  it('escapes parentheses', () => {
    expect(escapeRegex('(test)')).toBe('\\(test\\)');
  });

  it('escapes brackets', () => {
    expect(escapeRegex('[a-z]')).toBe('\\[a-z\\]');
  });

  it('escapes question marks', () => {
    expect(escapeRegex('test?')).toBe('test\\?');
  });

  it('escapes plus signs', () => {
    expect(escapeRegex('a+b')).toBe('a\\+b');
  });

  it('escapes dollar and caret', () => {
    expect(escapeRegex('^start$end')).toBe('\\^start\\$end');
  });

  it('escapes braces', () => {
    expect(escapeRegex('{1,3}')).toBe('\\{1,3\\}');
  });

  it('escapes pipe', () => {
    expect(escapeRegex('a|b')).toBe('a\\|b');
  });

  it('escapes backslash', () => {
    expect(escapeRegex('a\\b')).toBe('a\\\\b');
  });
});

describe('highlightMatch', () => {
  it('wraps search term in mark tags', () => {
    expect(highlightMatch('Text about Socrates', 'Socrates'))
      .toBe('Text about <mark>Socrates</mark>');
  });

  it('is case-insensitive', () => {
    expect(highlightMatch('SOCRATES was wise', 'socrates'))
      .toBe('<mark>SOCRATES</mark> was wise');
  });

  it('highlights multiple occurrences', () => {
    expect(highlightMatch('Socrates met Socrates', 'Socrates'))
      .toBe('<mark>Socrates</mark> met <mark>Socrates</mark>');
  });

  it('handles special regex characters in search term', () => {
    expect(highlightMatch('test [value]', '[value]'))
      .toBe('test <mark>[value]</mark>');
  });

  // XSS prevention tests
  it('escapes HTML in preview text', () => {
    const result = highlightMatch('<script>alert("xss")</script>', 'script');
    // Raw <script> tag should be escaped
    expect(result).not.toContain('<script>');
    // The word "script" is still highlighted within escaped text
    expect(result).toContain('<mark>script</mark>');
    // Angle brackets are escaped
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
  });

  it('escapes HTML in search term', () => {
    const result = highlightMatch('test <img> here', '<img>');
    // Raw <img> tag should be escaped
    expect(result).not.toContain('<img>');
    // Escaped version should be highlighted
    expect(result).toContain('<mark>&lt;img&gt;</mark>');
  });

  it('prevents XSS via malicious search term', () => {
    const malicious = '<img src=x onerror=alert(1)>';
    const result = highlightMatch(`text ${malicious} more`, malicious);
    // Raw HTML should not exist
    expect(result).not.toContain('<img ');
    // Escaped version exists and is highlighted
    expect(result).toContain('&lt;img');
    expect(result).toContain('&gt;');
  });

  it('escapes ampersands correctly', () => {
    expect(highlightMatch('foo & bar', '&'))
      .toBe('foo <mark>&amp;</mark> bar');
  });

  it('escapes quotes in preview', () => {
    expect(highlightMatch('say "hello"', 'hello'))
      .toBe('say &quot;<mark>hello</mark>&quot;');
  });
});

describe('filterReferences', () => {
  const items = ['103a1', '103a2', '103b1', '104a1', null];

  it('filters references by search term', () => {
    expect(filterReferences(items, '103a')).toEqual(['103a1', '103a2']);
  });

  it('is case-insensitive', () => {
    expect(filterReferences(items, '103A')).toEqual(['103a1', '103a2']);
  });

  it('returns empty array for empty search', () => {
    expect(filterReferences(items, '')).toEqual([]);
  });

  it('filters out null values', () => {
    expect(filterReferences(items, '103')).not.toContain(null);
  });

  it('returns all matches', () => {
    expect(filterReferences(items, '1')).toEqual(['103a1', '103a2', '103b1', '104a1']);
  });
});
