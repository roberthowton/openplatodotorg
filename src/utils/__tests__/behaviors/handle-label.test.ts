import { describe, it, expect } from 'vitest';
import { handleLabel } from '../../behaviors/handle-label';

describe('handleLabel', () => {
  it('sets marginLeft to 4rem', () => {
    const label = document.createElement('div');
    handleLabel(label);
    expect(label.style.marginLeft).toBe('4rem');
  });
});
