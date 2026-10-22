import { beforeEach, describe, expect, it } from "vitest";
import { THEME_STORE_KEY } from "@/constants/storage-keys";
import { useThemeStore } from "./theme-store";

const saved = (preference: unknown) =>
  localStorage.setItem(THEME_STORE_KEY, JSON.stringify({ state: { preference }, version: 1 }));

beforeEach(() => {
  useThemeStore.setState({ preference: "parchment" });
});

describe("theme store", () => {
  it("persists the chosen preference under the shared key", () => {
    useThemeStore.getState().setPreference("nocturne");
    const stored = JSON.parse(localStorage.getItem(THEME_STORE_KEY) ?? "{}");
    expect(stored).toEqual({ state: { preference: "nocturne" }, version: 1 });
  });

  it("restores a known preference", async () => {
    saved("clarity");
    await useThemeStore.persist.rehydrate();
    expect(useThemeStore.getState().preference).toBe("clarity");
  });

  it("ignores old or hand-edited values", async () => {
    for (const value of ["lobster", "dark", 42, null]) {
      saved(value);
      await useThemeStore.persist.rehydrate();
      expect(useThemeStore.getState().preference).toBe("parchment");
    }
  });
});
