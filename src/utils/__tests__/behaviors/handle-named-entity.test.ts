import { describe, it, expect, beforeEach } from 'vitest';
import { handlePersName, handlePlaceName, resolveAuthorityUrl } from '../../behaviors/handle-named-entity';

describe('resolveAuthorityUrl', () => {
  it('resolves tgn key to Getty TGN URL', () => {
    expect(resolveAuthorityUrl('tgn,1000074', null)).toBe('https://vocab.getty.edu/tgn/1000074');
  });
  it('resolves pleiades key', () => {
    expect(resolveAuthorityUrl('pleiades,579885', null)).toBe('https://pleiades.stoa.org/places/579885');
  });
  it('resolves wikidata key', () => {
    expect(resolveAuthorityUrl('wikidata,Q41', null)).toBe('https://www.wikidata.org/wiki/Q41');
  });
  it('resolves bare http ref', () => {
    expect(resolveAuthorityUrl(null, 'https://example.com/foo')).toBe('https://example.com/foo');
  });
  it('returns null for unknown key vocab', () => {
    expect(resolveAuthorityUrl('unknown,123', null)).toBeNull();
  });
  it('returns null for non-URL ref', () => {
    expect(resolveAuthorityUrl(null, 'Q913')).toBeNull();
  });
  it('returns null for null/null', () => {
    expect(resolveAuthorityUrl(null, null)).toBeNull();
  });
  it('key takes priority over ref', () => {
    expect(resolveAuthorityUrl('tgn,1000074', 'https://example.com')).toBe('https://vocab.getty.edu/tgn/1000074');
  });
});

describe('handlePlaceName', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('replaces tei-placename with <a> when key resolves', () => {
    document.body.innerHTML = '<tei-placename key="tgn,1000074">Greece</tei-placename>';
    const el = document.querySelector('tei-placename')!;
    handlePlaceName(el);
    const a = document.querySelector('a.named-entity.place');
    expect(a).not.toBeNull();
    expect(a?.getAttribute('href')).toBe('https://vocab.getty.edu/tgn/1000074');
    expect(a?.textContent).toBe('Greece');
    expect(a?.getAttribute('target')).toBe('_blank');
  });

  it('replaces with <span> when no resolvable key', () => {
    document.body.innerHTML = '<tei-placename>Somewhere</tei-placename>';
    const el = document.querySelector('tei-placename')!;
    handlePlaceName(el);
    expect(document.querySelector('span.named-entity.place')).not.toBeNull();
    expect(document.querySelector('a')).toBeNull();
  });

  it('carries data-key attribute through', () => {
    document.body.innerHTML = '<tei-placename key="tgn,1000074">Greece</tei-placename>';
    const el = document.querySelector('tei-placename')!;
    handlePlaceName(el);
    const a = document.querySelector('.named-entity') as HTMLElement;
    expect(a.dataset.key).toBe('tgn,1000074');
  });
});

describe('handlePersName', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('replaces tei-persname with <a> when ref is a URL', () => {
    document.body.innerHTML = '<tei-persname ref="https://www.wikidata.org/wiki/Q913">Socrates</tei-persname>';
    const el = document.querySelector('tei-persname')!;
    handlePersName(el);
    const a = document.querySelector('a.named-entity.person');
    expect(a).not.toBeNull();
    expect(a?.getAttribute('href')).toBe('https://www.wikidata.org/wiki/Q913');
    expect(a?.textContent).toBe('Socrates');
  });

  it('replaces with <span> when no ref', () => {
    document.body.innerHTML = '<tei-persname>Alcibiades</tei-persname>';
    const el = document.querySelector('tei-persname')!;
    handlePersName(el);
    expect(document.querySelector('span.named-entity.person')).not.toBeNull();
    expect(document.querySelector('a')).toBeNull();
  });

  it('carries data-ref attribute through', () => {
    document.body.innerHTML = '<tei-persname ref="https://www.wikidata.org/wiki/Q913">Socrates</tei-persname>';
    const el = document.querySelector('tei-persname')!;
    handlePersName(el);
    const span = document.querySelector('.named-entity') as HTMLElement;
    expect(span.dataset.ref).toBe('https://www.wikidata.org/wiki/Q913');
  });
});
