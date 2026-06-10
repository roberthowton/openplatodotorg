import { describe, it, expect } from 'vitest';
import { opaqueScheme } from '../opaque';

describe('opaqueScheme', () => {
  it('id is "opaque"', () => expect(opaqueScheme.id).toBe('opaque'));

  it('parse always returns { ref }', () => {
    expect(opaqueScheme.parse('anything')).toEqual({ ref: 'anything' });
    expect(opaqueScheme.parse('')).toEqual({ ref: '' });
    expect(opaqueScheme.parse('103a1')).toEqual({ ref: '103a1' });
  });

  it('inlineMarker always returns empty string', () => {
    expect(opaqueScheme.inlineMarker({ ref: 'foo' }, { ref: 'foo', isFirstLine: false })).toBe('');
  });

  it('blockMarker always returns empty string', () => {
    expect(opaqueScheme.blockMarker({ ref: 'foo' }, { ref: 'foo', isFirstLine: true })).toBe('');
  });

  it('showsBlockMarker always returns false', () => {
    expect(opaqueScheme.showsBlockMarker({ ref: 'foo' })).toBe(false);
    expect(opaqueScheme.showsBlockMarker({ ref: '103a1' })).toBe(false);
  });

  it('has no startingPageLabel', () => {
    expect(opaqueScheme.startingPageLabel).toBeUndefined();
  });
});
