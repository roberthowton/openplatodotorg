import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Tei from '../Tei.astro';
import processTei from '../../utils/processTei';

const sampleTeiXml = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <div>
        <p>Test paragraph</p>
      </div>
    </body>
  </text>
</TEI>`;

describe('Tei component (Container API)', () => {
  it('renders tei-container element', async () => {
    const teiData = processTei(sampleTeiXml);
    const container = await AstroContainer.create();
    const result = await container.renderToString(Tei, {
      props: { teiData },
    });
    expect(result).toContain('tei-container');
  });

  it('sets data-language attribute', async () => {
    const teiData = processTei(sampleTeiXml);
    const container = await AstroContainer.create();
    const result = await container.renderToString(Tei, {
      props: { teiData, language: 'gr' },
    });
    expect(result).toContain('data-language="gr"');
  });

  it('sets data-root-id attribute', async () => {
    const teiData = processTei(sampleTeiXml);
    const container = await AstroContainer.create();
    const result = await container.renderToString(Tei, {
      props: { teiData, rootId: 'greek-text' },
    });
    expect(result).toContain('data-root-id="greek-text"');
  });

  it('sets data-usebehaviors to true by default', async () => {
    const teiData = processTei(sampleTeiXml);
    const container = await AstroContainer.create();
    const result = await container.renderToString(Tei, {
      props: { teiData },
    });
    expect(result).toContain('data-usebehaviors="true"');
  });

  it('sets data-usebehaviors to false when specified', async () => {
    const teiData = processTei(sampleTeiXml);
    const container = await AstroContainer.create();
    const result = await container.renderToString(Tei, {
      props: { teiData, useBehaviors: false },
    });
    expect(result).toContain('data-usebehaviors="false"');
  });

  it('includes data-elements attribute', async () => {
    const teiData = processTei(sampleTeiXml);
    const container = await AstroContainer.create();
    const result = await container.renderToString(Tei, {
      props: { teiData },
    });
    expect(result).toContain('data-elements');
  });

  it('expands self-closing tags in serialized content', async () => {
    const teiData = processTei(sampleTeiXml);
    const container = await AstroContainer.create();
    const result = await container.renderToString(Tei, {
      props: { teiData },
    });
    // Should not contain self-closing tags like <foo/>
    expect(result).not.toMatch(/<tei-[^\s>]+\/>/);
  });
});
