// tests/ids.test.ts
import { describe, it, expect } from "vitest";
import { normalizeOrderId, extractASIN } from "../src/lib/ids";

describe("normalizeOrderId", () => {
  it("trims whitespace", () => {
    expect(normalizeOrderId("  408-4870009-9733125 ")).toBe("408-4870009-9733125");
  });

  it("returns empty string for null/undefined", () => {
    expect(normalizeOrderId("")).toBe("");
  });
});

describe("extractASIN", () => {
  it("extracts ASIN if present", () => {
    expect(extractASIN("product B08XYZ1234 info")).toBe("B08XYZ1234");
  });

  it("returns empty string if none found", () => {
    expect(extractASIN("no asin here")).toBe("");
  });
});
