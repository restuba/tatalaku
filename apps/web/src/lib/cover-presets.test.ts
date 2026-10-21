import { describe, expect, it } from "vitest";
import { COVER_PRESETS } from "./cover-presets";

describe("cover presets", () => {
  it("offers a handful of named covers", () => {
    expect(COVER_PRESETS.length).toBeGreaterThanOrEqual(4);
    expect(new Set(COVER_PRESETS.map((p) => p.label)).size).toBe(COVER_PRESETS.length);
  });

  it("each is an SVG gradient data URL that decodes to valid markup", () => {
    for (const preset of COVER_PRESETS) {
      expect(preset.value.startsWith("data:image/svg+xml,")).toBe(true);
      const svg = decodeURIComponent(preset.value.replace("data:image/svg+xml,", ""));
      expect(svg).toContain("<svg");
      expect(svg).toContain("linearGradient");
      // Both gradient stops carry through from the CSS swatch
      const colors = [...(preset.swatch ?? "").matchAll(/#[0-9a-f]{3,8}/gi)].map((m) => m[0]);
      expect(colors.length).toBe(2);
      for (const color of colors) expect(svg).toContain(color);
    }
  });

  it("passes a CSS gradient swatch for the dialog", () => {
    for (const preset of COVER_PRESETS) {
      expect(preset.swatch).toMatch(/^linear-gradient\(/);
    }
  });
});
