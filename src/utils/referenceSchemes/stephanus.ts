import type { MarkerCtx, ParsedRef, ReferenceScheme } from "./types";

// Stephanus pagination: {page}{column}{line}, e.g. "103a1", "104b10"
export const STEPHANUS_COLUMN_REGEX = new RegExp(/(a|b|c|d|e)/);
export const LINE_NUMBERS_TO_DISPLAY = ["1", "5", "10", "15"];

export const parseStephanusReference = (
  reference: string,
): { page: string; column: string; line: string } => {
  const [page, column, line] = reference.split(STEPHANUS_COLUMN_REGEX);
  return { page, column, line };
};

export const getStephanusLineMarker = (
  page: string,
  column: string,
  line: string,
): string => {
  if (line === "1") {
    return column === "a" ? page : column;
  }
  return line;
};

/** Matches {digits}{a-e}{digits}, e.g. "103a1", "104b10" */
const STEPHANUS_FULL_REGEX = /^\d+[a-e]\d+$/;

export const isStephanusRef = (ref: string): boolean =>
  STEPHANUS_FULL_REGEX.test(ref);

export const stephanusScheme: ReferenceScheme = {
  id: "stephanus",

  parse(ref: string): ParsedRef | null {
    if (!isStephanusRef(ref)) return null;
    const { page, column, line } = parseStephanusReference(ref);
    if (!page || !column || !line) return null;
    return { page, column, line };
  },

  inlineMarker(parsed: ParsedRef, _ctx: MarkerCtx): string {
    const { page, column, line } = parsed;
    if (line === "1" && column === "a") return `${page}${column}`;
    if (line === "1") return column;
    return line;
  },

  blockMarker(parsed: ParsedRef, ctx: MarkerCtx): string {
    const { page, column, line } = parsed;
    if (ctx.isFirstLine) return column;
    return getStephanusLineMarker(page, column, line);
  },

  showsBlockMarker(parsed: ParsedRef): boolean {
    return LINE_NUMBERS_TO_DISPLAY.includes(parsed.line);
  },

  startingPageLabel(firstRef: string): string {
    return parseStephanusReference(firstRef).page;
  },
};
