import { describe, it, expect } from 'vitest';
import { handleDiv } from '../../behaviors/handle-div';

describe('handleDiv', () => {
  it('applies flex column layout', () => {
    const div = document.createElement('div');
    handleDiv(div);
    expect(div.style.display).toBe('flex');
    expect(div.style.flexDirection).toBe('column');
  });

  it('sets width to 100%', () => {
    const div = document.createElement('div');
    handleDiv(div);
    expect(div.style.width).toBe('100%');
  });

  it('sets Porson font family', () => {
    const div = document.createElement('div');
    handleDiv(div);
    expect(div.style.fontFamily).toBe('Porson');
  });
});
