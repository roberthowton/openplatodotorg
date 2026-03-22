import { describe, it, expect } from 'vitest';
import { createHandleHead } from '../../behaviors/handle-head';
import type { DialogueConfig } from '../../../types';

const mockConfig: DialogueConfig = {
  teiTitle: { gr: 'ΑΛΚΙΒΙΑΔΗΣ', en: 'Alcibiades 1' },
  firstLineStephanusReference: '103a1',
};

describe('createHandleHead("gr")', () => {
  it('clears existing content', () => {
    const head = document.createElement('div');
    head.innerText = 'Original content';
    createHandleHead('gr', mockConfig)(head);
    expect(head.innerText).not.toBe('Original content');
  });

  it('creates h1 with Greek Alcibiades title', () => {
    const head = document.createElement('div');
    createHandleHead('gr', mockConfig)(head);
    const h1 = head.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1?.innerText).toBe('ΑΛΚΙΒΙΑΔΗΣ');
  });

  it('applies grid styles to element', () => {
    const head = document.createElement('div');
    createHandleHead('gr', mockConfig)(head);
    expect(head.style.display).toBe('grid');
  });

  it('applies Porson font and text styling to h1', () => {
    const head = document.createElement('div');
    createHandleHead('gr', mockConfig)(head);
    const h1 = head.querySelector('h1') as HTMLElement;
    expect(h1.style.fontFamily).toBe('Porson');
    expect(h1.style.textAlign).toBe('center');
    expect(h1.style.gridColumn).toBe('text');
  });
});

describe('createHandleHead("en")', () => {
  it('clears existing content', () => {
    const head = document.createElement('div');
    head.innerText = 'Original content';
    createHandleHead('en', mockConfig)(head);
    expect(head.innerText).not.toBe('Original content');
  });

  it('creates h1 with English Alcibiades title', () => {
    const head = document.createElement('div');
    createHandleHead('en', mockConfig)(head);
    const h1 = head.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1?.innerText).toBe('Alcibiades 1');
  });

  it('applies grid styles to element', () => {
    const head = document.createElement('div');
    createHandleHead('en', mockConfig)(head);
    expect(head.style.display).toBe('grid');
  });

  it('does not apply Porson font to h1', () => {
    const head = document.createElement('div');
    createHandleHead('en', mockConfig)(head);
    const h1 = head.querySelector('h1') as HTMLElement;
    expect(h1.style.fontFamily).not.toBe('Porson');
  });

  it('applies text alignment and grid column to h1', () => {
    const head = document.createElement('div');
    createHandleHead('en', mockConfig)(head);
    const h1 = head.querySelector('h1') as HTMLElement;
    expect(h1.style.textAlign).toBe('center');
    expect(h1.style.gridColumn).toBe('text');
  });
});
