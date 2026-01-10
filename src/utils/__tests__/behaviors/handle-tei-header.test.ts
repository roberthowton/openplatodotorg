import { describe, it, expect, beforeEach } from 'vitest';
import { handleTeiHeader } from '../../behaviors/handle-tei-header';

describe('handleTeiHeader', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <tei-head></tei-head>
      <div id="test-header">
        <tei-title>Test Title</tei-title>
        <tei-author>Test Author</tei-author>
        <tei-editor>Test Editor</tei-editor>
        <tei-person>
          <tei-persName>SOCRATES</tei-persName>
        </tei-person>
        <tei-person>
          <tei-persName>ALCIBIADES</tei-persName>
        </tei-person>
      </div>
    `;
  });

  it('hides title element', () => {
    const header = document.querySelector('#test-header')!;
    handleTeiHeader(header);
    const title = header.querySelector('tei-title');
    expect(title?.getAttribute('style')).toContain('display: none');
  });

  it('hides author element', () => {
    const header = document.querySelector('#test-header')!;
    handleTeiHeader(header);
    const author = header.querySelector('tei-author');
    expect(author?.getAttribute('style')).toContain('display: none');
  });

  it('hides editor element', () => {
    const header = document.querySelector('#test-header')!;
    handleTeiHeader(header);
    const editor = header.querySelector('tei-editor');
    expect(editor?.getAttribute('style')).toContain('display: none');
  });

  it('creates dramatis personae container', () => {
    const header = document.querySelector('#test-header')!;
    handleTeiHeader(header);
    const container = document.querySelector('#dramatis-personae-container');
    expect(container).not.toBeNull();
  });

  it('includes person names in dramatis personae', () => {
    const header = document.querySelector('#test-header')!;
    handleTeiHeader(header);
    const container = document.querySelector('#dramatis-personae-container');
    expect(container?.textContent).toContain('SOCRATES');
    expect(container?.textContent).toContain('ALCIBIADES');
  });

  it('applies grid styles to container', () => {
    const header = document.querySelector('#test-header')!;
    handleTeiHeader(header);
    const container = document.querySelector('#dramatis-personae-container') as HTMLElement;
    expect(container.style.display).toBe('grid');
  });

  it('creates stephanus page reference', () => {
    const header = document.querySelector('#test-header')!;
    handleTeiHeader(header);
    const container = document.querySelector('#dramatis-personae-container');
    // Should contain the page number from ALCIBIADES_FIRST_LINE_STEPHANUS_REFERENCE (103a1 -> 103)
    expect(container?.textContent).toContain('103');
  });

  it('inserts container after tei-head', () => {
    const header = document.querySelector('#test-header')!;
    handleTeiHeader(header);
    const teiHead = document.querySelector('tei-head');
    const nextSibling = teiHead?.nextElementSibling;
    expect(nextSibling?.id).toBe('dramatis-personae-container');
  });

  it('handles person without persName', () => {
    document.body.innerHTML = `
      <tei-head></tei-head>
      <div id="test-header">
        <tei-person></tei-person>
      </div>
    `;
    const header = document.querySelector('#test-header')!;
    handleTeiHeader(header);
    const container = document.querySelector('#dramatis-personae-container');
    const personDiv = container?.querySelector('.person');
    expect(personDiv?.innerHTML).toBe('');
  });
});
