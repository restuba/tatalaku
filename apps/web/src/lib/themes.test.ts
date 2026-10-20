import { describe, expect, it } from "vitest";
import { LEGACY_THEME_MODE_KEY, LEGACY_THEME_STORE_KEY } from "@/constants/storage-keys";
import {
  THEME_IDS,
  THEMES,
  getTheme,
  initialThemePreference,
  isThemePreference,
  resolveTheme,
} from "./themes";

/** A read-only storage stand-in holding the given keys */
function storageWith(entries: Record<string, string>): Pick<Storage, "getItem"> {
  return { getItem: (key) => entries[key] ?? null };
}

describe("themes", () => {
  it("defines exactly Parchment, Clarity and Nocturne", () => {
    expect(THEMES.map((theme) => theme.id)).toEqual([...THEME_IDS]);
    expect(THEME_IDS).toEqual(["parchment", "clarity", "nocturne"]);
    for (const id of THEME_IDS) expect(getTheme(id).id).toBe(id);
  });

  it("marks Nocturne as the only dark theme", () => {
    expect(THEMES.filter((theme) => theme.colorScheme === "dark").map((t) => t.id)).toEqual([
      "nocturne",
    ]);
  });

  it("accepts only known preferences", () => {
    expect(isThemePreference("system")).toBe(true);
    expect(isThemePreference("clarity")).toBe(true);
    for (const value of ["lobster", "dark", "", null, undefined, 1]) {
      expect(isThemePreference(value)).toBe(false);
    }
  });

  it("resolves Match system to Parchment by day and Nocturne by night", () => {
    expect(resolveTheme("system", false)).toBe("parchment");
    expect(resolveTheme("system", true)).toBe("nocturne");
    expect(resolveTheme("clarity", true)).toBe("clarity");
  });
});

describe("initialThemePreference", () => {
  it("starts first-time visitors on Parchment", () => {
    expect(initialThemePreference(storageWith({}))).toBe("parchment");
  });

  it("maps the old light/dark/system switch", () => {
    expect(initialThemePreference(storageWith({ [LEGACY_THEME_MODE_KEY]: "light" }))).toBe(
      "parchment",
    );
    expect(initialThemePreference(storageWith({ [LEGACY_THEME_MODE_KEY]: "dark" }))).toBe(
      "nocturne",
    );
    expect(initialThemePreference(storageWith({ [LEGACY_THEME_MODE_KEY]: "system" }))).toBe(
      "system",
    );
  });

  it("keeps users of the old preset store following the OS", () => {
    expect(initialThemePreference(storageWith({ [LEGACY_THEME_STORE_KEY]: "{}" }))).toBe("system");
  });

  it("ignores an unknown old mode", () => {
    expect(initialThemePreference(storageWith({ [LEGACY_THEME_MODE_KEY]: "sepia" }))).toBe(
      "parchment",
    );
  });
});
