import { describe, it, expect } from 'vitest';
import { handleStephanusMilestone } from '../../behaviors/handle-milestone';

describe('handleStephanusMilestone', () => {
  it('ignores non-Stephanus milestones', () => {
    const el = document.createElement('div');
    el.setAttribute('resp', 'other');
    el.setAttribute('unit', 'section');
    handleStephanusMilestone(el);
    expect(el.innerHTML).toBe('');
  });

  it('ignores non-section milestones', () => {
    const el = document.createElement('div');
    el.setAttribute('resp', 'Stephanus');
    el.setAttribute('unit', 'page');
    handleStephanusMilestone(el);
    expect(el.innerHTML).toBe('');
  });

  it('shows full label for section ending in a', () => {
    const el = document.createElement('div');
    el.setAttribute('resp', 'Stephanus');
    el.setAttribute('unit', 'section');
    el.setAttribute('n', '103a');
    handleStephanusMilestone(el);
    expect(el.innerHTML).toBe('103a');
  });

  it('shows last char for section not ending in a', () => {
    const el = document.createElement('div');
    el.setAttribute('resp', 'Stephanus');
    el.setAttribute('unit', 'section');
    el.setAttribute('n', '103b');
    handleStephanusMilestone(el);
    expect(el.innerHTML).toBe('b');
  });

  it('applies line marker styles', () => {
    const el = document.createElement('div');
    el.setAttribute('resp', 'Stephanus');
    el.setAttribute('unit', 'section');
    el.setAttribute('n', '103a');
    handleStephanusMilestone(el);
    expect(el.style.display).toBe('inline');
    expect(el.style.position).toBe('absolute');
  });
});
