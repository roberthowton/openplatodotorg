import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  parseStephanusReference,
  getStephanusLineMarker,
  getLineNumbersFromTeiDom,
  getUrlWithSearchParam,
  addOrUpdateUrlParam,
  getShowStateFromUrl,
  updateShowState,
  getIsShowing,
} from '../index';
import { ShowState, ShowStateAction } from '../../types';

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

describe('getUrlWithSearchParam', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { href: 'https://example.com/path' },
      writable: true,
    });
  });

  it('creates URL with new search param', () => {
    const url = getUrlWithSearchParam('ref', '103a1');
    expect(url.searchParams.get('ref')).toBe('103a1');
  });

  it('preserves existing path', () => {
    const url = getUrlWithSearchParam('show', 'gr');
    expect(url.pathname).toBe('/path');
  });
});

describe('addOrUpdateUrlParam', () => {
  let replaceStateSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { href: 'https://example.com/path' },
      writable: true,
    });
    replaceStateSpy = vi.fn();
    Object.defineProperty(window, 'history', {
      value: { replaceState: replaceStateSpy },
      writable: true,
    });
  });

  it('calls replaceState with updated URL', () => {
    addOrUpdateUrlParam('ref', '103a1');
    expect(replaceStateSpy).toHaveBeenCalledWith(
      {},
      '',
      expect.stringContaining('ref=103a1')
    );
  });
});

describe('getShowStateFromUrl', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { href: 'https://example.com/' },
      writable: true,
    });
  });

  it('returns FIRST_READ when no show param', () => {
    expect(getShowStateFromUrl()).toBe(ShowState.FIRST_READ);
  });

  it('returns FIRST_READ when show=firstRead', () => {
    window.location.href = 'https://example.com/?show=firstRead';
    expect(getShowStateFromUrl()).toBe(ShowState.FIRST_READ);
  });

  it('returns GREEK when show=gr', () => {
    window.location.href = 'https://example.com/?show=gr';
    expect(getShowStateFromUrl()).toBe(ShowState.GREEK);
  });

  it('returns ENGLISH when show=en', () => {
    window.location.href = 'https://example.com/?show=en';
    expect(getShowStateFromUrl()).toBe(ShowState.ENGLISH);
  });

  it('returns GREEK_AND_ENGLISH when both show=gr and show=en', () => {
    window.location.href = 'https://example.com/?show=gr&show=en';
    expect(getShowStateFromUrl()).toBe(ShowState.GREEK_AND_ENGLISH);
  });

  it('returns FIRST_READ for invalid multiple shows', () => {
    window.location.href = 'https://example.com/?show=gr&show=invalid';
    expect(getShowStateFromUrl()).toBe(ShowState.FIRST_READ);
  });
});

describe('updateShowState', () => {
  describe('HIDE action', () => {
    it('returns FIRST_READ when hiding current state', () => {
      expect(updateShowState(ShowState.GREEK, ShowState.GREEK, ShowStateAction.HIDE))
        .toBe(ShowState.FIRST_READ);
    });

    it('returns current state when hiding different state', () => {
      expect(updateShowState(ShowState.GREEK, ShowState.ENGLISH, ShowStateAction.HIDE))
        .toBe(ShowState.GREEK);
    });
  });

  describe('SHOW action', () => {
    it('returns FIRST_READ when adding FIRST_READ', () => {
      expect(updateShowState(ShowState.GREEK, ShowState.FIRST_READ, ShowStateAction.SHOW))
        .toBe(ShowState.FIRST_READ);
    });

    it('returns current state when adding same state', () => {
      expect(updateShowState(ShowState.GREEK, ShowState.GREEK, ShowStateAction.SHOW))
        .toBe(ShowState.GREEK);
    });

    it('returns current state when adding different state', () => {
      expect(updateShowState(ShowState.GREEK, ShowState.ENGLISH, ShowStateAction.SHOW))
        .toBe(ShowState.GREEK);
    });
  });
});

describe('getIsShowing', () => {
  describe('GREEK button', () => {
    it('returns true when urlShowState is GREEK', () => {
      expect(getIsShowing({ urlShowState: ShowState.GREEK, buttonShowState: ShowState.GREEK }))
        .toBe(true);
    });

    it('returns true when urlShowState is GREEK_AND_ENGLISH', () => {
      expect(getIsShowing({ urlShowState: ShowState.GREEK_AND_ENGLISH, buttonShowState: ShowState.GREEK }))
        .toBe(true);
    });

    it('returns false when urlShowState is ENGLISH', () => {
      expect(getIsShowing({ urlShowState: ShowState.ENGLISH, buttonShowState: ShowState.GREEK }))
        .toBe(false);
    });
  });

  describe('ENGLISH button', () => {
    it('returns true when urlShowState is ENGLISH', () => {
      expect(getIsShowing({ urlShowState: ShowState.ENGLISH, buttonShowState: ShowState.ENGLISH }))
        .toBe(true);
    });

    it('returns true when urlShowState is GREEK_AND_ENGLISH', () => {
      expect(getIsShowing({ urlShowState: ShowState.GREEK_AND_ENGLISH, buttonShowState: ShowState.ENGLISH }))
        .toBe(true);
    });

    it('returns false when urlShowState is GREEK', () => {
      expect(getIsShowing({ urlShowState: ShowState.GREEK, buttonShowState: ShowState.ENGLISH }))
        .toBe(false);
    });
  });

  describe('GREEK_AND_ENGLISH button', () => {
    it('returns true only when urlShowState is GREEK_AND_ENGLISH', () => {
      expect(getIsShowing({ urlShowState: ShowState.GREEK_AND_ENGLISH, buttonShowState: ShowState.GREEK_AND_ENGLISH }))
        .toBe(true);
      expect(getIsShowing({ urlShowState: ShowState.GREEK, buttonShowState: ShowState.GREEK_AND_ENGLISH }))
        .toBe(false);
    });
  });

  describe('FIRST_READ button', () => {
    it('returns true only when urlShowState is FIRST_READ', () => {
      expect(getIsShowing({ urlShowState: ShowState.FIRST_READ, buttonShowState: ShowState.FIRST_READ }))
        .toBe(true);
      expect(getIsShowing({ urlShowState: ShowState.GREEK, buttonShowState: ShowState.FIRST_READ }))
        .toBe(false);
    });
  });

  describe('UNKNOWN button', () => {
    it('always returns false', () => {
      expect(getIsShowing({ urlShowState: ShowState.GREEK, buttonShowState: ShowState.UNKNOWN }))
        .toBe(false);
      expect(getIsShowing({ urlShowState: ShowState.FIRST_READ, buttonShowState: ShowState.UNKNOWN }))
        .toBe(false);
    });
  });
});
