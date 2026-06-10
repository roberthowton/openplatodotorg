import { isStephanusRef, stephanusScheme } from "./stephanus";
import { opaqueScheme } from "./opaque";
import type { ReferenceScheme } from "./types";

export type { ReferenceScheme, ParsedRef, MarkerCtx } from "./types";
export { stephanusScheme, parseStephanusReference, getStephanusLineMarker, isStephanusRef, STEPHANUS_COLUMN_REGEX, LINE_NUMBERS_TO_DISPLAY } from "./stephanus";
export { opaqueScheme } from "./opaque";

const registry: Record<string, ReferenceScheme> = {
  stephanus: stephanusScheme,
  opaque: opaqueScheme,
};

/**
 * Resolve the reference scheme for a TEI document.
 *
 * Selection order:
 * 1. Infer Stephanus from conventions present in the XML:
 *    any `milestone[@resp="Stephanus"]` element → stephanus scheme.
 * 2. Explicit override in per-dialogue meta.json `referenceScheme` field.
 * 3. Opaque fallback.
 */
export const resolveScheme = (
  xmlDoc: Document,
  meta?: { referenceScheme?: string },
): ReferenceScheme => {
  // 1. Infer from XML conventions
  const hasStephanusMilestone =
    xmlDoc.querySelector('milestone[resp="Stephanus"]') !== null ||
    xmlDoc.querySelector("milestone[resp='Stephanus']") !== null;

  if (hasStephanusMilestone) return stephanusScheme;

  // Fallback: check lb@n values for Stephanus shape
  const firstLb = xmlDoc.querySelector("lb[n]");
  if (firstLb) {
    const n = firstLb.getAttribute("n") ?? "";
    if (isStephanusRef(n)) return stephanusScheme;
  }

  // 2. Explicit meta.json override
  if (meta?.referenceScheme) {
    return registry[meta.referenceScheme] ?? opaqueScheme;
  }

  // 3. Opaque fallback
  return opaqueScheme;
};
