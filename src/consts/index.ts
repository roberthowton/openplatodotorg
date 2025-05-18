export const LINE_MARKER_STYLE: Partial<CSSStyleDeclaration> = {
  display: "inline",

  position: "absolute",
  left: "500px",
};

export const GRID_STYLE = {
  display: "grid",
  gridTemplateColumns: "[text] 14fr [lineRef] 1fr",
  gridColumnGap: "1rem",
  justifyItems: "stretch",
};

export const STEPHANUS_COLUMN_REGEX = new RegExp(/(a|b|c|d|e)/);

export const LINE_NUMBERS_TO_DISPLAY = ["1", "5", "10", "15"];

export const ALCIBIADES_FIRST_LINE_STEPHANUS_REFERENCE = "103a1";

export const ALCIBIADES_TITLE = {
  GR: "ΑΛΚΙΒΙΑΔΗΣ",
};
