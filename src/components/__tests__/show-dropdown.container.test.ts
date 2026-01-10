import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ShowDropdown from '../show-dropdown.astro';

describe('ShowDropdown component (Container API)', () => {
  it('renders section element', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ShowDropdown);
    expect(result).toContain('<section');
  });

  it('contains Show Greek button', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ShowDropdown);
    expect(result).toContain('Show Greek');
  });

  it('contains Show English button', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ShowDropdown);
    expect(result).toContain('Show English');
  });

  it('contains First Read button', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ShowDropdown);
    expect(result).toContain('Go to First Read');
  });

  it('contains Hide buttons', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ShowDropdown);
    expect(result).toContain('Hide Greek');
    expect(result).toContain('Hide English');
    expect(result).toContain('Exit First Read');
  });
});
