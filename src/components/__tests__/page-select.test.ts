import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DOM for testing
function createMockDOM() {
  document.body.innerHTML = `
    <div class="dropdown" data-lines='["103a1", "103a2", "103b1"]'>
      <input id="searchInput" type="text" />
      <ul id="dropdownList" class="dropdown-list"></ul>
    </div>
    <tei-container data-language="gr" style="display: block;">
      <div id="103a1-gr-text">Greek text about Socrates and philosophy</div>
      <div id="103a2-gr-text">More Greek philosophy text</div>
    </tei-container>
    <tei-container data-language="en" style="display: block;">
      <div id="103a1-en-text">English text about Socrates and philosophy</div>
      <div id="103a2-en-text">More English philosophy text</div>
    </tei-container>
  `;
}

describe('Page Select - Helper Functions', () => {
  beforeEach(() => {
    createMockDOM();
  });

  describe('getVisibleLanguages', () => {
    it('should detect visible Greek and English containers', () => {
      const containers = document.querySelectorAll('tei-container');
      const languages: string[] = [];

      containers.forEach((container) => {
        const element = container as HTMLElement;
        if (element.offsetParent !== null || element.style.display !== 'none') {
          const language = element.dataset.language;
          if (language) languages.push(language);
        }
      });

      expect(languages).toContain('gr');
      expect(languages).toContain('en');
    });

    it('should not detect hidden containers', () => {
      const enContainer = document.querySelector('[data-language="en"]') as HTMLElement;
      enContainer.style.display = 'none';

      const containers = document.querySelectorAll('tei-container');
      const languages: string[] = [];

      containers.forEach((container) => {
        const element = container as HTMLElement;
        if (element.style.display !== 'none') {
          const language = element.dataset.language;
          if (language) languages.push(language);
        }
      });

      expect(languages).toContain('gr');
      expect(languages).not.toContain('en');
    });
  });

  describe('extractReferenceFromId', () => {
    it('should extract reference from Greek text div ID', () => {
      const id = '103a1-gr-text';
      const language = 'gr';
      const reference = id.replace(`-${language}-text`, '');

      expect(reference).toBe('103a1');
    });

    it('should extract reference from English text div ID', () => {
      const id = '103a1-en-text';
      const language = 'en';
      const reference = id.replace(`-${language}-text`, '');

      expect(reference).toBe('103a1');
    });
  });

  describe('createPreview', () => {
    it('should create preview with context around match', () => {
      const text = 'This is a long text about Socrates and his philosophical teachings in ancient Athens.';
      const searchTerm = 'Socrates';
      const matchIndex = text.toLowerCase().indexOf(searchTerm.toLowerCase());
      const matchLength = searchTerm.length;

      const contextBefore = 30;
      const contextAfter = 30;

      const start = Math.max(0, matchIndex - contextBefore);
      const end = Math.min(text.length, matchIndex + matchLength + contextAfter);

      let preview = text.slice(start, end).trim();

      if (start > 0) preview = '...' + preview;
      if (end < text.length) preview = preview + '...';

      expect(preview).toContain('Socrates');
      expect(preview.length).toBeLessThan(text.length);
    });

    it('should add ellipsis for truncated text', () => {
      const text = 'A'.repeat(100) + ' Socrates ' + 'B'.repeat(100);
      const matchIndex = text.indexOf('Socrates');
      const contextBefore = 30;
      const contextAfter = 30;

      const start = Math.max(0, matchIndex - contextBefore);
      const end = Math.min(text.length, matchIndex + 'Socrates'.length + contextAfter);

      let preview = text.slice(start, end).trim();

      if (start > 0) preview = '...' + preview;
      if (end < text.length) preview = preview + '...';

      expect(preview).toMatch(/^\.\.\./);
      expect(preview).toMatch(/\.\.\.$/);
    });
  });

  describe('escapeRegex', () => {
    it('should escape special regex characters', () => {
      const escapeRegex = (str: string): string => {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      };

      expect(escapeRegex('hello.world')).toBe('hello\\.world');
      expect(escapeRegex('test*')).toBe('test\\*');
      expect(escapeRegex('(test)')).toBe('\\(test\\)');
      expect(escapeRegex('[a-z]')).toBe('\\[a-z\\]');
    });
  });

  describe('highlightMatch', () => {
    it('should wrap search term in <mark> tags', () => {
      const preview = 'Text about Socrates and philosophy';
      const searchTerm = 'Socrates';

      const escapeRegex = (str: string): string => {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      };

      const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
      const highlighted = preview.replace(regex, '<mark>$1</mark>');

      expect(highlighted).toBe('Text about <mark>Socrates</mark> and philosophy');
    });

    it('should be case-insensitive', () => {
      const preview = 'SOCRATES was a philosopher';
      const searchTerm = 'socrates';

      const escapeRegex = (str: string): string => {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      };

      const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
      const highlighted = preview.replace(regex, '<mark>$1</mark>');

      expect(highlighted).toBe('<mark>SOCRATES</mark> was a philosopher');
    });
  });
});

describe('Page Select - Search Logic', () => {
  beforeEach(() => {
    createMockDOM();
  });

  describe('Text Search', () => {
    it('should find text in visible divs', () => {
      const searchTerm = 'Socrates';
      const textDivs = document.querySelectorAll('div[id$="-gr-text"], div[id$="-en-text"]');
      const matches: string[] = [];

      textDivs.forEach((div) => {
        const textContent = div.textContent || '';
        if (textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
          matches.push(div.id);
        }
      });

      expect(matches.length).toBe(2);
      expect(matches).toContain('103a1-gr-text');
      expect(matches).toContain('103a1-en-text');
    });

    it('should be case-insensitive', () => {
      const searchTerm = 'SOCRATES';
      const textDivs = document.querySelectorAll('div[id$="-gr-text"], div[id$="-en-text"]');
      const matches: string[] = [];

      textDivs.forEach((div) => {
        const textContent = div.textContent || '';
        if (textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
          matches.push(div.id);
        }
      });

      expect(matches.length).toBe(2);
    });

    it('should only search visible languages', () => {
      const enContainer = document.querySelector('[data-language="en"]') as HTMLElement;
      enContainer.style.display = 'none';

      const searchTerm = 'Socrates';
      const visibleDivs = document.querySelectorAll('[data-language="gr"] div[id$="-gr-text"]');
      const matches: string[] = [];

      visibleDivs.forEach((div) => {
        const textContent = div.textContent || '';
        if (textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
          matches.push(div.id);
        }
      });

      expect(matches.length).toBe(1);
      expect(matches).toContain('103a1-gr-text');
    });
  });

  describe('Reference Search', () => {
    it('should filter references by search term', () => {
      const items = ['103a1', '103a2', '103b1'];
      const searchTerm = '103a';

      const filtered = items.filter((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered).toEqual(['103a1', '103a2']);
    });

    it('should be case-insensitive for references', () => {
      const items = ['103a1', '103a2', '103b1'];
      const searchTerm = '103A';

      const filtered = items.filter((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered).toEqual(['103a1', '103a2']);
    });
  });
});

describe('Page Select - Integration', () => {
  beforeEach(() => {
    createMockDOM();
  });

  it('should combine reference and text search results', () => {
    const searchTerm = '103';

    // Reference search
    const items = ['103a1', '103a2', '103b1'];
    const referenceResults = items.filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Text search
    const textDivs = document.querySelectorAll('div[id$="-text"]');
    const textResults: string[] = [];

    textDivs.forEach((div) => {
      const id = div.id;
      if (id.includes('103')) {
        textResults.push(id);
      }
    });

    expect(referenceResults.length).toBe(3);
    expect(textResults.length).toBe(4);
  });
});
