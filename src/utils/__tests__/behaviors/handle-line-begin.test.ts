import { describe, it, expect, beforeEach } from 'vitest';
import { handleLineBegin } from '../../behaviors/handle-line-begin';

describe('handleLineBegin', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <tei-container data-language="gr">
        <tei-lb n="103a1"></tei-lb>
        First line text content
        <tei-lb n="103a2"></tei-lb>
        Second line text content
        <tei-lb n="103a5"></tei-lb>
        Fifth line text
        <tei-lb n="103a10"></tei-lb>
        Tenth line text
      </tei-container>
    `;
  });

  it('returns early when no next sibling at all', () => {
    // Create a truly isolated lb element with no siblings
    const container = document.createElement('tei-container');
    container.dataset.language = 'gr';
    const lb = document.createElement('tei-lb');
    lb.setAttribute('n', '103a1');
    container.appendChild(lb);
    document.body.innerHTML = '';
    document.body.appendChild(container);

    // Should return early without processing (no text div added)
    handleLineBegin(lb);
    expect(lb.querySelector('div')).toBeNull();
  });

  it('sets element id with language suffix', () => {
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    handleLineBegin(lb);
    expect(lb.id).toBe('103a1-gr');
  });

  it('sets English language suffix from container', () => {
    document.body.innerHTML = `
      <tei-container data-language="en">
        <tei-lb n="103a1"></tei-lb>
        Text content
        <tei-lb n="103a2"></tei-lb>
      </tei-container>
    `;
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    handleLineBegin(lb);
    expect(lb.id).toBe('103a1-en');
  });

  it('creates text div with id', () => {
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    handleLineBegin(lb);
    const textDiv = document.getElementById('103a1-gr-text');
    expect(textDiv).not.toBeNull();
  });

  it('applies grid styles to lb element', () => {
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    handleLineBegin(lb);
    expect(lb.style.display).toBe('grid');
  });

  it('adds stephanus-line class to text div', () => {
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    handleLineBegin(lb);
    const textDiv = lb.querySelector('div');
    expect(textDiv?.classList.contains('stephanus-line')).toBe(true);
  });

  it('adds line marker for line 1 column a (shows page)', () => {
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    handleLineBegin(lb);
    const marker = lb.querySelector('b');
    // First line of document shows column (103a1 is ALCIBIADES_FIRST_LINE)
    expect(marker?.innerText).toBe('a');
  });

  it('adds line marker for line 5', () => {
    const lb = document.querySelector('tei-lb[n="103a5"]') as HTMLElement;
    handleLineBegin(lb);
    const marker = lb.querySelector('b');
    expect(marker?.innerText).toBe('5');
  });

  it('adds line marker for line 10', () => {
    const lb = document.querySelector('tei-lb[n="103a10"]') as HTMLElement;
    handleLineBegin(lb);
    const marker = lb.querySelector('b');
    expect(marker?.innerText).toBe('10');
  });

  it('does not add marker for line 2', () => {
    const lb = document.querySelector('tei-lb[n="103a2"]') as HTMLElement;
    handleLineBegin(lb);
    const marker = lb.querySelector('b');
    expect(marker).toBeNull();
  });

  it('extracts text content into div', () => {
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    handleLineBegin(lb);
    const textDiv = lb.querySelector('div');
    expect(textDiv?.textContent).toContain('First line text content');
  });

  it('handles break="no" by adding hyphen', () => {
    document.body.innerHTML = `
      <tei-container data-language="gr">
        <tei-lb n="103a1" break="no"></tei-lb>
        continuation text
        <tei-lb n="103a2"></tei-lb>
      </tei-container>
    `;
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    handleLineBegin(lb);
    const textDiv = lb.querySelector('div');
    expect(textDiv?.textContent).toContain('-');
  });

  it('adds last class to last line in section', () => {
    document.body.innerHTML = `
      <tei-container data-language="gr">
        <div>
          <tei-lb n="103a1"></tei-lb>
          Only line in this div
        </div>
      </tei-container>
    `;
    const lb = document.querySelector('tei-lb') as HTMLElement;
    handleLineBegin(lb);
    const textDiv = lb.querySelector('div');
    expect(textDiv?.classList.contains('last')).toBe(true);
  });

  it('handles label elements within range', () => {
    document.body.innerHTML = `
      <tei-container data-language="gr">
        <tei-lb n="103a1"></tei-lb>
        <tei-label>SOCRATES:</tei-label> Speaking text
        <tei-lb n="103a2"></tei-lb>
      </tei-container>
    `;
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    handleLineBegin(lb);
    const textDiv = lb.querySelector('div');
    expect(textDiv?.innerHTML).toContain('<b>SOCRATES:</b>');
  });

  it('removes milestone elements from range', () => {
    document.body.innerHTML = `
      <tei-container data-language="gr">
        <tei-lb n="103a1"></tei-lb>
        <tei-milestone n="103a"></tei-milestone>
        Regular text
        <tei-lb n="103a2"></tei-lb>
      </tei-container>
    `;
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    handleLineBegin(lb);
    const textDiv = lb.querySelector('div');
    expect(textDiv?.querySelector('tei-milestone')).toBeNull();
  });

  it('sets ariaHidden on line marker', () => {
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    handleLineBegin(lb);
    const marker = lb.querySelector('b');
    expect(marker?.ariaHidden).toBe('true');
  });

  it('applies text justify style to div', () => {
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    handleLineBegin(lb);
    const textDiv = lb.querySelector('div') as HTMLElement;
    expect(textDiv.style.textAlign).toBe('justify');
  });

  it('defaults to gr language when no container found', () => {
    document.body.innerHTML = `
      <div>
        <tei-lb n="103a1"></tei-lb>
        Text content
        <tei-lb n="103a2"></tei-lb>
      </div>
    `;
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    handleLineBegin(lb);
    expect(lb.id).toBe('103a1-gr');
  });

  it('finds text node through multiple non-text siblings', () => {
    document.body.innerHTML = `
      <tei-container data-language="gr">
        <tei-lb n="103a1"></tei-lb><span></span><em></em>
        Text after elements
        <tei-lb n="103a2"></tei-lb>
      </tei-container>
    `;
    const lb = document.querySelector('tei-lb[n="103a1"]') as HTMLElement;
    handleLineBegin(lb);
    const textDiv = lb.querySelector('div');
    expect(textDiv?.textContent).toContain('Text after elements');
  });
});
