import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  LEGACY_THEME_MODE_KEY,
  LEGACY_THEME_STORE_KEY,
  THEME_STORE_KEY,
  UI_STORE_KEY,
} from "@/constants/storage-keys";
import { stubMatchMedia } from "@/test/setup";
import { REDUCED_MOTION_QUERY } from "./motion";
import { PREPAINT_SCRIPT } from "./prepaint";
import { DARK_SCHEME_QUERY, THEME_IDS } from "./themes";

const themeStore = (preference: string) => JSON.stringify({ state: { preference }, version: 1 });
const uiStore = (state: Record<string, unknown>) => JSON.stringify({ state, version: 0 });

/** Runs the inline <head> script against the given storage and media state */
function prepaint(storage: Record<string, string> = {}, media: readonly string[] = []) {
  for (const [key, value] of Object.entries(storage)) localStorage.setItem(key, value);
  stubMatchMedia(media);
  // The script is shipped as a string; evaluate it the way the browser would
  new Function(PREPAINT_SCRIPT)();
  const { theme, motion, readingSize } = document.documentElement.dataset;
  return { theme, motion, readingSize };
}

beforeEach(() => {
  for (const attr of ["data-theme", "data-motion", "data-reading-size"]) {
    document.documentElement.removeAttribute(attr);
  }
});

describe("pre-paint script: theme", () => {
  it("gives a first-time visitor Parchment", () => {
    expect(prepaint().theme).toBe("parchment");
  });

  it.each(THEME_IDS)("applies the stored %s theme", (id) => {
    expect(prepaint({ [THEME_STORE_KEY]: themeStore(id) }).theme).toBe(id);
  });

  it("follows the device for Match system", () => {
    const stored = { [THEME_STORE_KEY]: themeStore("system") };
    expect(prepaint(stored, [DARK_SCHEME_QUERY]).theme).toBe("nocturne");
    localStorage.clear();
    expect(prepaint(stored, []).theme).toBe("parchment");
  });

  it("carries the old light/dark switch over", () => {
    expect(prepaint({ [LEGACY_THEME_MODE_KEY]: "dark" }).theme).toBe("nocturne");
    localStorage.clear();
    expect(prepaint({ [LEGACY_THEME_MODE_KEY]: "light" }).theme).toBe("parchment");
    localStorage.clear();
    expect(prepaint({ [LEGACY_THEME_MODE_KEY]: "system" }, [DARK_SCHEME_QUERY]).theme).toBe(
      "nocturne",
    );
  });

  it("keeps users of the old preset store on Match system", () => {
    expect(prepaint({ [LEGACY_THEME_STORE_KEY]: "{}" }, [DARK_SCHEME_QUERY]).theme).toBe(
      "nocturne",
    );
  });

  it("falls back to Parchment for unknown or corrupt stored values", () => {
    expect(prepaint({ [THEME_STORE_KEY]: themeStore("lobster") }).theme).toBe("parchment");
    localStorage.clear();
    expect(prepaint({ [THEME_STORE_KEY]: "{not json" }).theme).toBe("parchment");
  });

  it("still paints a theme when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(prepaint().theme).toBe("parchment");
  });
});

describe("pre-paint script: motion and text size", () => {
  it("follows the OS reduce-motion setting by default", () => {
    expect(prepaint().motion).toBe("full");
    expect(prepaint({}, [REDUCED_MOTION_QUERY]).motion).toBe("reduce");
  });

  it("lets the in-app setting override the OS", () => {
    expect(prepaint({ [UI_STORE_KEY]: uiStore({ motion: "off" }) }).motion).toBe("reduce");
    localStorage.clear();
    expect(
      prepaint({ [UI_STORE_KEY]: uiStore({ motion: "on" }) }, [REDUCED_MOTION_QUERY]).motion,
    ).toBe("full");
  });

  it("sets a known reading size and ignores anything else", () => {
    expect(prepaint({ [UI_STORE_KEY]: uiStore({ readingSize: "large" }) }).readingSize).toBe(
      "large",
    );
    document.documentElement.removeAttribute("data-reading-size");
    localStorage.clear();
    expect(
      prepaint({ [UI_STORE_KEY]: uiStore({ readingSize: "huge" }) }).readingSize,
    ).toBeUndefined();
  });
});
