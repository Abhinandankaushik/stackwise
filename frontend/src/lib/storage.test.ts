import { describe, it, expect } from "vitest";
import { decodeSharePayload, encodeSharePayload } from "./storage";

describe("storage share payload", () => {
  it("round-trips encode/decode", () => {
    const payload = {
      findings: [{ toolName: "Cursor", monthlySavings: 40 }],
      totals: { current: 200, recommended: 160, savings: 40, annual: 480 },
      state: "some_savings",
      useCase: "coding",
      teamSize: 5,
      generatedAt: "2026-05-20T00:00:00.000Z",
    };
    const slug = encodeSharePayload(payload);
    const decoded = decodeSharePayload<typeof payload>(slug);
    expect(decoded).toEqual(payload);
  });

  it("returns null for invalid slug", () => {
    expect(decodeSharePayload("not-valid!!!")).toBeNull();
  });

  it("strips padding from base64url slug", () => {
    const slug = encodeSharePayload({ ok: true });
    expect(slug).not.toMatch(/=$/);
    expect(decodeSharePayload(slug)).toEqual({ ok: true });
  });
});
