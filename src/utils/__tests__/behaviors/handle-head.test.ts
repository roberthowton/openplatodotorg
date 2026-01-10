import { describe, it, expect } from 'vitest';
import { handleHead } from '../../behaviors/handle-head';

describe('handleHead', () => {
  it('clears existing content', () => {
    const head = document.createElement('div');
    head.innerText = 'Original content';
    handleHead(head);
    expect(head.innerText).not.toBe('Original content');
  });

  it('creates h1 with Greek Alcibiades title', () => {
    const head = document.createElement('div');
    handleHead(head);
    const h1 = head.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1?.innerText).toBe('ΑΛΚΙΒΙΑΔΗΣ');
  });

  it('applies grid styles to element', () => {
    const head = document.createElement('div');
    handleHead(head);
    expect(head.style.display).toBe('grid');
  });

  it('applies text styling to h1', () => {
    const head = document.createElement('div');
    handleHead(head);
    const h1 = head.querySelector('h1') as HTMLElement;
    expect(h1.style.fontFamily).toBe('Porson');
    expect(h1.style.textAlign).toBe('center');
    expect(h1.style.gridColumn).toBe('text');
  });
});
