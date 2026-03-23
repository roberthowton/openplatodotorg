import { describe, it, expect } from 'vitest';
import { createHandleTeiHeader } from '../../behaviors/handle-tei-header';
import type { DialogueConfig } from '../../../types';

const mockConfig: DialogueConfig = {
  teiTitle: { gr: 'ΑΛΚΙΒΙΑΔΗΣ', en: 'Alcibiades 1' },
  firstLineStephanusReference: '103a1',
};

function makeHeader(id = 'test-header') {
  document.body.innerHTML = `
    <tei-container>
      <tei-head></tei-head>
      <div id="${id}">
        <tei-title>Test Title</tei-title>
        <tei-author>Test Author</tei-author>
        <tei-editor>Test Editor</tei-editor>
        <tei-sponsor>Perseus Project</tei-sponsor>
        <tei-principal>Gregory Crane</tei-principal>
        <tei-respstmt><resp>Prepared under supervision of</resp></tei-respstmt>
        <tei-funder>Annenberg</tei-funder>
        <tei-person>
          <tei-persName>SOCRATES</tei-persName>
        </tei-person>
        <tei-person>
          <tei-persName>ALCIBIADES</tei-persName>
        </tei-person>
      </div>
    </tei-container>
  `;
  return document.querySelector(`#${id}`)!;
}

describe('createHandleTeiHeader("gr")', () => {
  it('hides title element', () => {
    const header = makeHeader();
    createHandleTeiHeader('gr', mockConfig)(header);
    expect(header.querySelector('tei-title')?.classList.contains('tei-hidden')).toBe(true);
  });

  it('hides author element', () => {
    const header = makeHeader();
    createHandleTeiHeader('gr', mockConfig)(header);
    expect(header.querySelector('tei-author')?.classList.contains('tei-hidden')).toBe(true);
  });

  it('hides editor element', () => {
    const header = makeHeader();
    createHandleTeiHeader('gr', mockConfig)(header);
    expect(header.querySelector('tei-editor')?.classList.contains('tei-hidden')).toBe(true);
  });

  it('creates dramatis personae container', () => {
    const header = makeHeader();
    createHandleTeiHeader('gr', mockConfig)(header);
    expect(document.querySelector('#dramatis-personae-container-gr')).not.toBeNull();
  });

  it('includes person names in dramatis personae', () => {
    const header = makeHeader();
    createHandleTeiHeader('gr', mockConfig)(header);
    const container = document.querySelector('#dramatis-personae-container-gr');
    expect(container?.textContent).toContain('SOCRATES');
    expect(container?.textContent).toContain('ALCIBIADES');
  });

  it('applies tei-grid class to container', () => {
    const header = makeHeader();
    createHandleTeiHeader('gr', mockConfig)(header);
    const container = document.querySelector('#dramatis-personae-container-gr') as HTMLElement;
    expect(container.classList.contains('tei-grid')).toBe(true);
  });

  it('creates stephanus page reference', () => {
    const header = makeHeader();
    createHandleTeiHeader('gr', mockConfig)(header);
    const container = document.querySelector('#dramatis-personae-container-gr');
    expect(container?.textContent).toContain('103');
  });

  it('inserts container after tei-head within tei-container', () => {
    const header = makeHeader();
    createHandleTeiHeader('gr', mockConfig)(header);
    const teiHead = document.querySelector('tei-head');
    const nextSibling = teiHead?.nextElementSibling;
    expect(nextSibling?.id).toBe('dramatis-personae-container-gr');
  });

  it('does not hide metadata elements', () => {
    const header = makeHeader();
    createHandleTeiHeader('gr', mockConfig)(header);
    expect(header.querySelector('tei-sponsor')?.classList.contains('tei-hidden')).toBe(false);
    expect(header.querySelector('tei-principal')?.classList.contains('tei-hidden')).toBe(false);
  });

  it('handles person without persName', () => {
    document.body.innerHTML = `
      <tei-container>
        <tei-head></tei-head>
        <div id="test-header">
          <tei-person></tei-person>
        </div>
      </tei-container>
    `;
    const header = document.querySelector('#test-header')!;
    createHandleTeiHeader('gr', mockConfig)(header);
    const container = document.querySelector('#dramatis-personae-container-gr');
    const personDiv = container?.querySelector('.person');
    expect(personDiv?.innerHTML).toBe('');
  });
});

describe('createHandleTeiHeader("en")', () => {
  it('creates dramatis personae container for English', () => {
    const header = makeHeader();
    createHandleTeiHeader('en', mockConfig)(header);
    expect(document.querySelector('#dramatis-personae-container-en')).not.toBeNull();
  });

  it('includes person names in English dramatis personae', () => {
    const header = makeHeader();
    createHandleTeiHeader('en', mockConfig)(header);
    const container = document.querySelector('#dramatis-personae-container-en');
    expect(container?.textContent).toContain('SOCRATES');
    expect(container?.textContent).toContain('ALCIBIADES');
  });

  it('hides sponsor element', () => {
    const header = makeHeader();
    createHandleTeiHeader('en', mockConfig)(header);
    expect(header.querySelector('tei-sponsor')?.classList.contains('tei-hidden')).toBe(true);
  });

  it('hides principal element', () => {
    const header = makeHeader();
    createHandleTeiHeader('en', mockConfig)(header);
    expect(header.querySelector('tei-principal')?.classList.contains('tei-hidden')).toBe(true);
  });

  it('hides respstmt element', () => {
    const header = makeHeader();
    createHandleTeiHeader('en', mockConfig)(header);
    expect(header.querySelector('tei-respstmt')?.classList.contains('tei-hidden')).toBe(true);
  });

  it('hides funder element', () => {
    const header = makeHeader();
    createHandleTeiHeader('en', mockConfig)(header);
    expect(header.querySelector('tei-funder')?.classList.contains('tei-hidden')).toBe(true);
  });

  it('inserts container after tei-head within tei-container', () => {
    const header = makeHeader();
    createHandleTeiHeader('en', mockConfig)(header);
    const teiHead = document.querySelector('tei-head');
    const nextSibling = teiHead?.nextElementSibling;
    expect(nextSibling?.id).toBe('dramatis-personae-container-en');
  });
});
