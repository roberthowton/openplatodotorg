import { describe, it, expect } from 'vitest';
import { buildShowUrl, getShowParamsFromUrl } from '../show-button-client';
import { ShowState } from '../../types';

describe('buildShowUrl', () => {
  const baseUrl = 'https://example.com/page';

  describe('show action (isShowing=false)', () => {
    it('adds Greek show param', () => {
      const result = buildShowUrl(baseUrl, ShowState.GREEK, false);
      expect(result).toContain('show=gr');
    });

    it('adds English show param', () => {
      const result = buildShowUrl(baseUrl, ShowState.ENGLISH, false);
      expect(result).toContain('show=en');
    });

    it('entering first read clears other show params', () => {
      const urlWithParams = 'https://example.com/page?show=gr&show=en';
      const result = buildShowUrl(urlWithParams, ShowState.FIRST_READ, false);
      expect(result).toContain('show=firstRead');
      expect(result).not.toContain('show=gr');
      expect(result).not.toContain('show=en');
    });

    it('does not duplicate existing show param', () => {
      const urlWithGreek = 'https://example.com/page?show=gr';
      const result = buildShowUrl(urlWithGreek, ShowState.GREEK, false);
      const showParams = getShowParamsFromUrl(result);
      expect(showParams.filter(p => p === 'gr').length).toBe(1);
    });
  });

  describe('hide action (isShowing=true)', () => {
    it('removes Greek show param', () => {
      const urlWithGreek = 'https://example.com/page?show=gr';
      const result = buildShowUrl(urlWithGreek, ShowState.GREEK, true);
      expect(result).not.toContain('show=gr');
    });

    it('hiding Greek with no params adds English', () => {
      const result = buildShowUrl(baseUrl, ShowState.GREEK, true);
      expect(result).toContain('show=en');
      expect(result).not.toContain('show=gr');
    });

    it('hiding English with no params adds Greek', () => {
      const result = buildShowUrl(baseUrl, ShowState.ENGLISH, true);
      expect(result).toContain('show=gr');
      expect(result).not.toContain('show=en');
    });

    it('removes English but keeps Greek', () => {
      const urlWithBoth = 'https://example.com/page?show=gr&show=en';
      const result = buildShowUrl(urlWithBoth, ShowState.ENGLISH, true);
      expect(result).toContain('show=gr');
      expect(result).not.toContain('show=en');
    });

    it('exiting first read shows both languages', () => {
      const urlWithFirstRead = 'https://example.com/page?show=firstRead';
      const result = buildShowUrl(urlWithFirstRead, ShowState.FIRST_READ, true);
      expect(result).toContain('show=gr');
      expect(result).toContain('show=en');
      expect(result).not.toContain('show=firstRead');
    });
  });
});

describe('getShowParamsFromUrl', () => {
  it('returns empty array when no show params', () => {
    expect(getShowParamsFromUrl('https://example.com/')).toEqual([]);
  });

  it('returns single show param', () => {
    expect(getShowParamsFromUrl('https://example.com/?show=gr')).toEqual(['gr']);
  });

  it('returns multiple show params', () => {
    expect(getShowParamsFromUrl('https://example.com/?show=gr&show=en'))
      .toEqual(['gr', 'en']);
  });
});
