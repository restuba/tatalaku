import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatTimeAgo, toISODate } from "./date";

const NOW = new Date("2026-10-21T12:00:00Z");
const ago = (ms: number) => new Date(NOW.getTime() - ms);
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("formatTimeAgo", () => {
  it("returns an empty string for missing or invalid input", () => {
    expect(formatTimeAgo(null)).toBe("");
    expect(formatTimeAgo(undefined)).toBe("");
    expect(formatTimeAgo("not a date")).toBe("");
  });

  it("uses short, sentence-case relative units", () => {
    expect(formatTimeAgo(ago(5 * SECOND))).toBe("just now");
    expect(formatTimeAgo(ago(30 * SECOND))).toBe("30s ago");
    expect(formatTimeAgo(ago(5 * MINUTE))).toBe("5m ago");
    expect(formatTimeAgo(ago(3 * HOUR))).toBe("3h ago");
    expect(formatTimeAgo(ago(30 * HOUR))).toBe("yesterday");
    expect(formatTimeAgo(ago(3 * DAY))).toBe("3d ago");
  });

  it("accepts ISO strings and timestamps", () => {
    expect(formatTimeAgo(ago(2 * HOUR).toISOString())).toBe("2h ago");
    expect(formatTimeAgo(ago(2 * HOUR).getTime())).toBe("2h ago");
  });

  it("switches to a calendar date after a week", () => {
    const date = ago(10 * DAY);
    expect(formatTimeAgo(date)).toBe(
      date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    );
  });
});

describe("toISODate", () => {
  it("returns an ISO string for valid dates only", () => {
    expect(toISODate(NOW)).toBe("2026-10-21T12:00:00.000Z");
    expect(toISODate("nope")).toBeUndefined();
    expect(toISODate(null)).toBeUndefined();
  });
});
