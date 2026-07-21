import { describe, expect, it } from "vitest";

import { formatIdr } from "./format-idr";

describe("formatIdr", () => {
  it("formats whole rupiah without decimals", () => {
    expect(formatIdr(150000)).toBe("Rp150.000");
  });

  it("formats zero", () => {
    expect(formatIdr(0)).toBe("Rp0");
  });
});
