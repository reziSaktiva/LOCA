import { describe, expect, it } from "vitest";

import { safeRedirectPath } from "./safe-redirect-path";

describe("safeRedirectPath", () => {
  it("returns relative path as-is", () => {
    expect(safeRedirectPath("/cart")).toBe("/cart");
    expect(safeRedirectPath("/account?tab=addresses")).toBe("/account?tab=addresses");
  });

  it("rejects external and protocol-relative URLs", () => {
    expect(safeRedirectPath("https://evil.example")).toBe("/");
    expect(safeRedirectPath("//evil.example")).toBe("/");
    expect(safeRedirectPath("evil.example")).toBe("/");
  });

  it("uses fallback for empty values", () => {
    expect(safeRedirectPath(undefined, "/products")).toBe("/products");
    expect(safeRedirectPath("", "/products")).toBe("/products");
  });
});
