/**
 * Resolve a TEI @key or @ref attribute to an authority URL.
 *
 * Supported key formats:
 *   tgn,{id}   → https://vocab.getty.edu/tgn/{id}  (Getty Thesaurus of Geographic Names)
 *   pleiades,{id} → https://pleiades.stoa.org/places/{id}
 *   wikidata,{id} → https://www.wikidata.org/wiki/{id}
 *
 * A bare @ref value that looks like a URL is returned as-is.
 */
export const resolveAuthorityUrl = (key: string | null, ref: string | null): string | null => {
  if (key) {
    const comma = key.indexOf(",");
    if (comma !== -1) {
      const vocab = key.slice(0, comma).toLowerCase();
      const id = key.slice(comma + 1);
      if (vocab === "tgn") return `https://vocab.getty.edu/tgn/${id}`;
      if (vocab === "pleiades") return `https://pleiades.stoa.org/places/${id}`;
      if (vocab === "wikidata") return `https://www.wikidata.org/wiki/${id}`;
    }
  }
  if (ref && /^https?:\/\//.test(ref)) return ref;
  return null;
};

const replaceWithNamedEntity = (
  element: Element,
  entityClass: "person" | "place",
): void => {
  const doc = element.ownerDocument;
  const key = element.getAttribute("key");
  const ref = element.getAttribute("ref");
  const url = resolveAuthorityUrl(key, ref);

  const replacement = url
    ? doc.createElement("a")
    : doc.createElement("span");

  replacement.className = `named-entity ${entityClass}`;
  replacement.innerHTML = element.innerHTML;

  if (url && replacement.tagName.toLowerCase() === "a") {
    replacement.setAttribute("href", url);
    replacement.setAttribute("target", "_blank");
    replacement.setAttribute("rel", "noopener noreferrer");
  }

  if (key) (replacement as HTMLElement).dataset.key = key;
  if (ref) (replacement as HTMLElement).dataset.ref = ref;

  element.replaceWith(replacement);
};

export const handlePersName = (element: Element): void =>
  replaceWithNamedEntity(element, "person");

export const handlePlaceName = (element: Element): void =>
  replaceWithNamedEntity(element, "place");
