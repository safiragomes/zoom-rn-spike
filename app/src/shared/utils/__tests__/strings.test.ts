import { initials, truncate } from "../strings";

describe("truncate", () => {
  it("returns the original text when it already fits", () => {
    expect(truncate("Hello world", 20)).toBe("Hello world");
  });

  it("cuts while keeping the last whole word", () => {
    expect(truncate("mobile boilerplate starter", 18)).toBe(
      "mobile boilerplate…",
    );
  });

  it("cuts at the limit when there is no word boundary", () => {
    expect(truncate("supercalifragilistic", 6)).toBe("superc…");
  });

  it("returns an empty string for a non-positive limit", () => {
    expect(truncate("anything at all", 0)).toBe("");
  });
});

describe("initials", () => {
  it("extracts two initials by default", () => {
    expect(initials("Beatriz Pedrosa")).toBe("BP");
  });

  it("respects the requested count", () => {
    expect(initials("Ana Clara de Souza", 3)).toBe("ACD");
  });

  it("ignores extra whitespace", () => {
    expect(initials("  Rafael   Victor  ")).toBe("RV");
  });

  it("returns an empty string for blank input", () => {
    expect(initials("   ")).toBe("");
  });
});
