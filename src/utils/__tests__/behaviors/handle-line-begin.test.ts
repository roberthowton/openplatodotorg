import { describe, it, expect, beforeEach } from 'vitest';
import { createHandleLineBegin } from '../../behaviors/handle-line-begin';
import type { DialogueConfig } from '../../../types';

const mockConfig: DialogueConfig = {
  teiTitle: { gr: 'ΑΛΚΙΒΙΑΔΗΣ', en: 'Alcibiades 1' },
  firstLineStephanusReference: '103a1',
};

describe('createHandleLineBegin', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div>
        <tei-lb n="103a1"></tei-lb>
        First line text content
        <tei-lb n="103a2"></tei-lb>
        Second line text content
        <tei-lb n="103a5"></tei-lb>
        Fifth line text
        <tei-lb n="103a10"></tei-lb>
        Tenth line text
      </div>
    `;
  });

  it('returns early when no next sibling at all', () => {
    const container = document.createElement('div');
    const lb = document.createElement('tei-lb');
    lb.setAttribute('n', '103a1');
    container.appendChild(lb);
    document.body.innerHTML = '';
    document.body.appendChild(container);

    createHandleLineBegin('gr', mockConfig)(lb);
    expect(lb.querySelector('div')).toBeNull();
  });

  it('sets element id with gr language suffix', () => {
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    createHandleLineBegin('gr', mockConfig)(lb);
    expect(lb.id).toBe('103a1-gr');
  });

  it('sets element id with en language suffix', () => {
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    createHandleLineBegin('en', mockConfig)(lb);
    expect(lb.id).toBe('103a1-en');
  });

  it('creates text div with id', () => {
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    createHandleLineBegin('gr', mockConfig)(lb);
    const textDiv = document.getElementById('103a1-gr-text');
    expect(textDiv).not.toBeNull();
  });

  it('applies tei-grid class to lb element', () => {
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    createHandleLineBegin('gr', mockConfig)(lb);
    expect(lb.classList.contains('tei-grid')).toBe(true);
  });

  it('adds stephanus-line class to text div', () => {
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    createHandleLineBegin('gr', mockConfig)(lb);
    const textDiv = lb.querySelector('div');
    expect(textDiv?.classList.contains('stephanus-line')).toBe(true);
  });

  it('adds block line marker for line 1 column a (shows column)', () => {
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    createHandleLineBegin('gr', mockConfig)(lb);
    const marker = lb.querySelector('.line-marker-block');
    // First line of document shows column (103a1 is ALCIBIADES_FIRST_LINE)
    expect(marker?.textContent).toBe('a');
  });

  it('adds inline line marker for line 1 column a (shows page+column)', () => {
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    createHandleLineBegin('gr', mockConfig)(lb);
    const marker = lb.querySelector('.line-marker-inline');
    expect(marker?.textContent).toBe('[103a] ');
  });

  it('adds block line marker for line 5', () => {
    const lb = document.querySelector('tei-lb[n="103a5"]') as HTMLElement;
    createHandleLineBegin('gr', mockConfig)(lb);
    const marker = lb.querySelector('.line-marker-block');
    expect(marker?.textContent).toBe('5');
  });

  it('adds block line marker for line 10', () => {
    const lb = document.querySelector('tei-lb[n="103a10"]') as HTMLElement;
    createHandleLineBegin('gr', mockConfig)(lb);
    const marker = lb.querySelector('.line-marker-block');
    expect(marker?.textContent).toBe('10');
  });

  it('does not add block marker for line 2', () => {
    const lb = document.querySelector('tei-lb[n="103a2"]') as HTMLElement;
    createHandleLineBegin('gr', mockConfig)(lb);
    const marker = lb.querySelector('.line-marker-block');
    expect(marker).toBeNull();
  });

  it('adds inline marker for line 2', () => {
    const lb = document.querySelector('tei-lb[n="103a2"]') as HTMLElement;
    createHandleLineBegin('gr', mockConfig)(lb);
    const marker = lb.querySelector('.line-marker-inline');
    expect(marker?.textContent).toBe('[2] ');
  });

  it('extracts text content into div', () => {
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    createHandleLineBegin('gr', mockConfig)(lb);
    const textDiv = lb.querySelector('div');
    expect(textDiv?.textContent).toContain('First line text content');
  });

  it('handles break="no" by adding hyphen', () => {
    document.body.innerHTML = `
      <div>
        <tei-lb n="103a1" break="no"></tei-lb>
        continuation text
        <tei-lb n="103a2"></tei-lb>
      </div>
    `;
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    createHandleLineBegin('gr', mockConfig)(lb);
    const textDiv = lb.querySelector('div');
    expect(textDiv?.textContent).toContain('-');
  });

  it('adds last class to last line in section', () => {
    document.body.innerHTML = `
      <div>
        <tei-lb n="103a1"></tei-lb>
        Only line in this div
      </div>
    `;
    const lb = document.querySelector('tei-lb') as HTMLElement;
    createHandleLineBegin('gr', mockConfig)(lb);
    const textDiv = lb.querySelector('div');
    expect(textDiv?.classList.contains('last')).toBe(true);
  });

  it('handles label elements within range', () => {
    document.body.innerHTML = `
      <div>
        <tei-lb n="103a1"></tei-lb>
        <tei-label>SOCRATES:</tei-label> Speaking text
        <tei-lb n="103a2"></tei-lb>
      </div>
    `;
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    createHandleLineBegin('gr', mockConfig)(lb);
    const textDiv = lb.querySelector('div');
    expect(textDiv?.innerHTML).toContain('<b>SOCRATES:</b>');
  });

  it('removes milestone elements from range', () => {
    document.body.innerHTML = `
      <div>
        <tei-lb n="103a1"></tei-lb>
        <tei-milestone n="103a"></tei-milestone>
        Regular text
        <tei-lb n="103a2"></tei-lb>
      </div>
    `;
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    createHandleLineBegin('gr', mockConfig)(lb);
    const textDiv = lb.querySelector('div');
    expect(textDiv?.querySelector('tei-milestone')).toBeNull();
  });

  it('sets aria-hidden on line marker', () => {
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    createHandleLineBegin('gr', mockConfig)(lb);
    const marker = lb.querySelector('b');
    expect(marker?.getAttribute('aria-hidden')).toBe('true');
  });

  it('adds stephanus-line class to text div (handles justify via CSS)', () => {
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    createHandleLineBegin('gr', mockConfig)(lb);
    const textDiv = lb.querySelector('div') as HTMLElement;
    expect(textDiv.classList.contains('stephanus-line')).toBe(true);
  });

  it('finds text node through multiple non-text siblings', () => {
    document.body.innerHTML = `
      <div>
        <tei-lb n="103a1"></tei-lb><span></span><em></em>
        Text after elements
        <tei-lb n="103a2"></tei-lb>
      </div>
    `;
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    createHandleLineBegin('gr', mockConfig)(lb);
    const textDiv = lb.querySelector('div');
    expect(textDiv?.textContent).toContain('Text after elements');
  });
});
