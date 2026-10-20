import { afterEach } from "vitest";

/**
 * jsdom has no matchMedia. The stores and the pre-paint script call it, so
 * every test starts with a stub where no media query matches; a test that
 * needs one to match stubs it again (see stubMatchMedia).
 */
export function stubMatchMedia(matching: readonly string[] = []): void {
  window.matchMedia = (query: string) =>
    ({
      matches: matching.includes(query),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

stubMatchMedia();

afterEach(() => {
  localStorage.clear();
  stubMatchMedia();
});
