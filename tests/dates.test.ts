// tests/dates.test.ts
import { describe, it, expect } from "vitest";
import { parseDateToISO } from "../src/lib/dates";

describe("parseDateToISO", () => {
  it("parses YYYY-MM-DD", () => {
    expect(parseDateToISO("2025-08-01")).toBe("2025-08-01");
  });

  it("parses MM/DD/YYYY", () => {
    expect(parseDateToISO("08/18/2025")).toBe("2025-08-18");
  });

  it("parses MMDDYYYY", () => {
    expect(parseDateToISO("08182025")).toBe("2025-08-18");
  });

  it("parses MMDDYY with pivot", () => {
    expect(parseDateToISO("081870")).toBe("1970-08-18"); // < pivot
    expect(parseDateToISO("081825")).toBe("2025-08-18"); // <= pivot
  });

  it("returns — for invalid", () => {
    expect(parseDateToISO("notadate")).toBe("—");
  });
});
