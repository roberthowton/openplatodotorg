// Extracted helper functions from page-select.astro for testing

export interface SearchResult {
  type: 'reference' | 'text';
  reference: string;
  textPreview?: string;
  matchIndex?: number;
}

export function extractReferenceFromId(id: string, language: string): string {
  return id.replace(`-${language}-text`, '');
}

export function createPreview(text: string, matchIndex: number, matchLength: number): string {
  const contextBefore = 30;
  const contextAfter = 30;

  const start = Math.max(0, matchIndex - contextBefore);
  const end = Math.min(text.length, matchIndex + matchLength + contextAfter);

  let preview = text.slice(start, end).trim();

  if (start > 0) preview = '...' + preview;
  if (end < text.length) preview = preview + '...';

  return preview;
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlightMatch(preview: string, searchTerm: string): string {
  const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
  return preview.replace(regex, '<mark>$1</mark>');
}

export function filterReferences(items: (string | null)[], searchText: string): string[] {
  if (!searchText) return [];
  const searchLower = searchText.toLowerCase();
  return items
    .filter((item): item is string => item !== null && item.toLowerCase().includes(searchLower));
}
