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

  describe('first read mode', () => {
    it('hides Greek button in first read mode', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(ShowDropdown, {
        request: new Request('https://example.com/?show=firstRead'),
      });
      expect(result).not.toContain('Show Greek');
      expect(result).not.toContain('Hide Greek');
    });

    it('hides English button in first read mode', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(ShowDropdown, {
        request: new Request('https://example.com/?show=firstRead'),
      });
      expect(result).not.toContain('Show English');
      expect(result).not.toContain('Hide English');
    });

    it('shows Exit First Read in first read mode', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(ShowDropdown, {
        request: new Request('https://example.com/?show=firstRead'),
      });
      expect(result).toContain('Exit First Read');
    });
  });
});
