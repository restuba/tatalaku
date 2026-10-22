import { beforeEach, describe, expect, it } from "vitest";
import { UI_STORE_KEY } from "@/constants/storage-keys";
import { isSettingsTab, useUIStore } from "./ui-store";

const saved = (state: Record<string, unknown>) =>
  localStorage.setItem(UI_STORE_KEY, JSON.stringify({ state, version: 0 }));

beforeEach(() => {
  useUIStore.setState({ settingsTab: null, lastSettingsTab: "account" });
});

describe("Settings section memory", () => {
  it("opens on My account the first time", () => {
    useUIStore.getState().openSettings();
    expect(useUIStore.getState().settingsTab).toBe("account");
  });

  it("reopens on the section that was open last", () => {
    const { openSettings, setSettingsTab, closeSettings } = useUIStore.getState();
    openSettings();
    setSettingsTab("appearance");
    closeSettings();
    expect(useUIStore.getState().settingsTab).toBeNull();

    openSettings();
    expect(useUIStore.getState().settingsTab).toBe("appearance");
  });

  it("opens a requested section and remembers it", () => {
    useUIStore.getState().openSettings("members");
    useUIStore.getState().closeSettings();
    useUIStore.getState().openSettings();
    expect(useUIStore.getState().settingsTab).toBe("members");
  });

  it("restores a saved section and rejects unknown ones", async () => {
    saved({ lastSettingsTab: "general" });
    await useUIStore.persist.rehydrate();
    expect(useUIStore.getState().lastSettingsTab).toBe("general");

    useUIStore.setState({ lastSettingsTab: "account" });
    saved({ lastSettingsTab: "billing" });
    await useUIStore.persist.rehydrate();
    expect(useUIStore.getState().lastSettingsTab).toBe("account");
  });

  it("never persists the open dialog itself", () => {
    useUIStore.getState().openSettings("appearance");
    const stored = JSON.parse(localStorage.getItem(UI_STORE_KEY) ?? "{}");
    expect(stored.state.lastSettingsTab).toBe("appearance");
    expect(stored.state).not.toHaveProperty("settingsTab");
  });
});

describe("isSettingsTab", () => {
  it("accepts the four sections only", () => {
    for (const tab of ["account", "appearance", "general", "members"]) {
      expect(isSettingsTab(tab)).toBe(true);
    }
    for (const value of ["billing", "", null, 3]) expect(isSettingsTab(value)).toBe(false);
  });
});
