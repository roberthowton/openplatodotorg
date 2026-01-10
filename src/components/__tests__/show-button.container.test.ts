import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ShowButton from '../show-button.astro';
import { ShowState } from '../../types';

describe('ShowButton component (Container API)', () => {
  it('renders show-button custom element', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ShowButton, {
      props: { show: ShowState.GREEK },
    });
    expect(result).toContain('show-button');
  });

  it('sets data-show attribute with state value', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ShowButton, {
      props: { show: ShowState.GREEK },
    });
    expect(result).toContain('data-show="gr"');
  });

  it('renders radio inputs for show/hide', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ShowButton, {
      props: { show: ShowState.ENGLISH },
    });
    expect(result).toContain('type="radio"');
  });

  it('renders control div with labels', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ShowButton, {
      props: { show: ShowState.GREEK },
    });
    expect(result).toContain('class="control"');
    expect(result).toContain('<label');
  });
});
