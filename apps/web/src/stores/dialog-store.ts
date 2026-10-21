"use client";

import { create } from "zustand";

/**
 * App-wide replacement for window.confirm / window.prompt.
 *
 * Call `confirmDialog()` / `promptDialog()` from anywhere (components, editor
 * commands) and await the result; <DialogHost /> renders the active request.
 * Only one dialog is shown at a time — a new request cancels the previous one.
 */

export type DialogTone = "default" | "danger";

interface BaseOptions {
  title: string;
  description?: string | undefined;
  confirmLabel?: string | undefined;
  cancelLabel?: string | undefined;
}

export interface ConfirmOptions extends BaseOptions {
  /** `danger` styles the confirm button as destructive and focuses Cancel */
  tone?: DialogTone | undefined;
}

/** A one-click value offered above the prompt input (e.g. a cover preset) */
export interface PromptPreset {
  /** Accessible name */
  label: string;
  /** The value chosen when picked (submits immediately) */
  value: string;
  /** CSS background for the swatch; falls back to the value as an image */
  swatch?: string | undefined;
}

export interface PromptOptions extends BaseOptions {
  label?: string | undefined;
  placeholder?: string | undefined;
  defaultValue?: string | undefined;
  inputType?: "text" | "url" | "email" | undefined;
  /** Return an error message to block submit, or null when the value is valid */
  validate?: ((value: string) => string | null) | undefined;
  /** Quick-pick values shown as swatches above the input */
  presets?: ReadonlyArray<PromptPreset> | undefined;
}

export type DialogRequest =
  | ({ id: number; kind: "confirm"; resolve: (ok: boolean) => void } & ConfirmOptions)
  | ({ id: number; kind: "prompt"; resolve: (value: string | null) => void } & PromptOptions);

interface DialogState {
  request: DialogRequest | null;
  /** Resolves the active request and closes it */
  settle: (result: boolean | string | null) => void;
}

let nextId = 0;

export const useDialogStore = create<DialogState>()((set, get) => ({
  request: null,
  settle: (result) => {
    const current = get().request;
    if (!current) return;
    set({ request: null });
    if (current.kind === "confirm") current.resolve(result === true);
    else current.resolve(typeof result === "string" ? result : null);
  },
}));

function cancelActive(): void {
  const current = useDialogStore.getState().request;
  if (!current) return;
  if (current.kind === "confirm") current.resolve(false);
  else current.resolve(null);
}

/** Resolves to `true` when the user confirms, `false` on cancel/dismiss. */
export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  cancelActive();
  return new Promise<boolean>((resolve) => {
    useDialogStore.setState({ request: { ...options, id: ++nextId, kind: "confirm", resolve } });
  });
}

/** Resolves to the trimmed value on submit, or `null` on cancel/dismiss. */
export function promptDialog(options: PromptOptions): Promise<string | null> {
  cancelActive();
  return new Promise<string | null>((resolve) => {
    useDialogStore.setState({ request: { ...options, id: ++nextId, kind: "prompt", resolve } });
  });
}
