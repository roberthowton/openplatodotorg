import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Head from '../head.astro';

describe('Head component (Container API)', () => {
  it('renders meta charset', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Head);
    expect(result).toContain('charset');
  });

  it('renders viewport meta tag', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Head);
    expect(result).toContain('viewport');
  });
});
